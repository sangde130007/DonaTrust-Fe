import React from 'react';
import Button from './Button';
import { useNavigate } from 'react-router-dom';

const Slider = ({ 
  title = "CHUNG TAY XÂY DỰNG CỘNG ĐỒNG TỐT ĐẸP HƠN!", 
  subtitle = "Khám phá và hỗ trợ các dự án từ thiện đáng tin cậy.",
  buttonText = "KHÁM PHÁ CHIẾN DỊCH",
  backgroundImage = "/images/bacground_homepage.jpg",
  onButtonClick
}) => {
  const navigate = useNavigate(); 

  const handleClick = () => {
    navigate('/campaigns'); 
  };
  return (
    <div 
      className="relative w-full h-[670px] bg-cover bg-center opacity-[100%]"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="flex flex-col absolute left-[15%] top-[147px] w-[518px] h-[116px] ">
        <h1 className="text-white text-[42px] font-bold leading-tight drop-shadow-lg mb-4 max-w-[600px]">
          {title}
        </h1>
        <p className="text-white text-lg font-normal mb-6 drop-shadow max-w-[500px]">
          {subtitle}
        </p>
        <div className="mt-[21px]">
          <Button className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded font-semibold shadow-lg transition" variant="secondary" size="md" onClick={handleClick}>
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Slider;