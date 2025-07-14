import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import ProjectCard from './ProjectCard';

const Profile = () => {
  const supportedProjects = [
    {
      id: 1,
      title: 'HỖ TRỢ HỌC SINH ĐẾN TRƯỜNG NĂM 2025',
      organization: 'Quỹ Vì trẻ em khuyết tật Việt Nam',
      category: 'Trẻ em',
      image: '/images/img_image_18.png',
      avatar: '/images/img_ellipse_8_20x21.png',
      raised: '9.720.000',
      percentage: '32.4%',
      goal: '30.000.000 VND'
    },
    {
      id: 2,
      title: 'XÂY DỰNG TRƯỜNG HỌC CHO TRẺ EM VÙNG CAO',
      organization: 'Quỹ Vì trẻ em khuyết tật Việt Nam',
      category: 'Trẻ em',
      image: '/images/img_image_18_104x137.png',
      avatar: '/images/img_ellipse_8_20x21.png',
      raised: '9.720.000',
      percentage: '32.4%',
      goal: '30.000.000 VND'
    },
    {
      id: 3,
      title: 'PHỦ XANH RỨNG NĂM 2025',
      organization: 'Trung tâm Con người & Thiên nhiên',
      category: 'Môi trường',
      image: '/images/img_image_18_3.png',
      avatar: '/images/img_ellipse_8_1.png',
      raised: '9.720.000',
      percentage: '32.4%',
      goal: '30.000.000 VND'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Cover Image */}
      <div className="w-full">
        <img
          src="/images/img__1.png"
          alt="Ảnh bìa"
          className="w-full h-[500px] object-cover"
        />
      </div>

      {/* Thông tin cá nhân */}
      <div className="w-full bg-white px-[15%] -mt-16">
        <div className="flex justify-between items-center flex-wrap">
          {/* Avatar và thông tin */}
          <div className="flex items-center gap-6 mb-0">
            <img
              src="/images/img_ellipse_43.png"
              alt="Avatar"
              className="w-[150px] h-[150px] rounded-full border-4 border-white shadow-md"
            />
            <div>
              <h1 className="text-2xl font-bold text-black">Nguyễn Tiến Đạt</h1>
              <p className="text-base text-gray-600">@datnguyentien09</p>
              <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                <span>0 người theo dõi</span>
                <span>0 bài viết</span>
              </div>
            </div>
          </div>

          {/* Nút chỉnh sửa */}
          <div className="flex items-center gap-3">
            <Link to="/profile/edit">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-6 py-2 rounded-lg font-semibold shadow-md">
                Chỉnh sửa thông tin
              </Button>
            </Link>
            <img
              src="/images/img_24_user_interface_image.svg"
              alt="Chia sẻ"
              className="w-7 h-7 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Thống kê */}
      <div className="w-full flex justify-center mt-12 mb-8">
        <div className="flex justify-between w-[600px] text-center border-t border-b py-5">
          <div>
            <p className="text-gray-600 text-sm">Dự án đã ủng hộ</p>
            <p className="text-pink-600 text-lg font-bold">3</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Tổ chức đã ủng hộ</p>
            <p className="text-pink-600 text-lg font-bold">0</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Tổng số tiền đã quyên góp</p>
            <p className="text-pink-600 text-lg font-bold">950.000 VND</p>
          </div>
        </div>
      </div>

      {/* Danh sách dự án */}
      <div className="text-center mb-20 px-[15%]">
        <h2 className="text-[32px] font-bold text-black mb-12">
          CÁC DỰ ÁN ĐÃ ỦNG HỘ
        </h2>

        <div className="flex justify-center gap-10 flex-wrap mb-14">
          {supportedProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>

        <div className="flex justify-center">
  <Link to="/campaigns">
    <Button className="bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold px-10 py-3 rounded-lg shadow-lg">
      Khám phá thêm các chiến dịch
    </Button>
  </Link>
</div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
