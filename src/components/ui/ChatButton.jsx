import React, { useState, useContext } from 'react';
import chatService from '../../services/chatService';
import ChatWindow from './ChatWindow';
import { FiMessageCircle, FiUsers } from 'react-icons/fi';
import AuthContext from '@/context/AuthContext';

const ChatButton = ({
  type = 'campaign', // 'campaign' or 'charity'
  entityId, // campaignId or charityId
  entityData = {}, // campaign or charity data for display
  className = '',
  buttonText = 'Chat với tổ chức'
}) => {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const [error, setError] = useState(null);

  const handleStartChat = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để sử dụng tính năng chat');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let response;
      if (type === 'campaign') {
        response = await chatService.joinCampaignChat(entityId);
      } else {
        response = await chatService.joinCharityChat(entityId);
      }

      if (response.status === 'success') {
        setRoomData(response.data);
        setIsChatOpen(true);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      setError('Không thể bắt đầu chat. Vui lòng thử lại.');

      // Show user-friendly error message
      if (error.response?.status === 404) {
        setError('Không tìm thấy thông tin để chat.');
      } else if (error.response?.status === 401) {
        setError('Vui lòng đăng nhập để sử dụng tính năng chat.');
      } else {
        setError('Lỗi kết nối. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setRoomData(null);
    setError(null);
  };

  const getChatTitle = () => {
    if (type === 'campaign' && roomData?.campaign) {
      return `Chat - ${roomData.campaign.title}`;
    } else if (type === 'charity' && roomData?.charity) {
      return `Chat - ${roomData.charity.name}`;
    }
    return 'Chat với tổ chức';
  };

  const getChatSubtitle = () => {
    if (type === 'campaign' && roomData?.campaign?.charity) {
      return roomData.campaign.charity.name;
    } else if (type === 'charity' && roomData?.charity) {
      return 'Tổ chức từ thiện';
    }
    return '';
  };

  if (!user) {
    return null; // Don't show chat button for unauthenticated users
  }

  return (
    <>
      <button
        onClick={handleStartChat}
        disabled={isLoading}
        className={`inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors bg-global-7 hover:bg-global-5 disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}
      >
        <FiMessageCircle className="mr-2" size={16} />
        {isLoading ? 'Đang kết nối...' : buttonText}
      </button>

      {error && (
        <div className="p-2 mt-2 text-sm text-red-700 bg-red-100 rounded border border-red-300">
          {error}
        </div>
      )}

      {/* Chat Window */}
      <ChatWindow
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        roomData={roomData}
        title={getChatTitle()}
        subtitle={getChatSubtitle()}
      />
    </>
  );
};

// Floating Chat Button for organization pages
export const FloatingChatButton = ({
  type = 'charity',
  entityId,
  entityData = {}
}) => {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [roomData, setRoomData] = useState(null);

  const handleStartChat = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để sử dụng tính năng chat');
      return;
    }

    try {
      setIsLoading(true);

      let response;
      if (type === 'campaign') {
        response = await chatService.joinCampaignChat(entityId);
      } else {
        response = await chatService.joinCharityChat(entityId);
      }

      if (response.status === 'success') {
        setRoomData(response.data);
        setIsChatOpen(true);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Không thể bắt đầu chat. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setRoomData(null);
  };

  const getChatTitle = () => {
    if (type === 'campaign' && roomData?.campaign) {
      return `Chat - ${roomData.campaign.title}`;
    } else if (type === 'charity' && roomData?.charity) {
      return `Chat - ${roomData.charity.name}`;
    }
    return 'Chat với tổ chức';
  };

  const getChatSubtitle = () => {
    if (type === 'campaign' && roomData?.campaign?.charity) {
      return roomData.campaign.charity.name;
    } else if (type === 'charity' && roomData?.charity) {
      return 'Tổ chức từ thiện';
    }
    return '';
  };

  if (!user) {
    return null; // Don't show chat button for unauthenticated users
  }

  return (
    <>
      {!isChatOpen && (
        <button
          onClick={handleStartChat}
          disabled={isLoading}
          className="fixed bottom-4 left-4 z-40 p-4 text-white rounded-full shadow-lg transition-colors bg-global-7 hover:bg-global-5 disabled:bg-gray-400"
          title="Chat với tổ chức"
        >
          <FiMessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      <ChatWindow
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        roomData={roomData}
        title={getChatTitle()}
        subtitle={getChatSubtitle()}
      />
    </>
  );
};

export default ChatButton;
