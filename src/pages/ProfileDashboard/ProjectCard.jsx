import React from 'react';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project }) => {
  const categoryColors = {
    'Children': 'bg-global-4', // Xanh nước biển (mã màu chung hệ thống)
    'Environment': 'bg-global-4'
  };

  return (
    <div className="relative w-[240px] h-[360px] bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Ảnh đại diện dự án */}
      <div className="relative w-full h-[150px]">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover"
        />

        {/* Badge thể loại */}
        <div
          className={`absolute top-2 right-2 ${categoryColors[project.category] || 'bg-global-4'} px-3 py-1 rounded-full shadow-md`}
        >
          <span className="text-[10px] font-semibold text-white">
            {project.category}
          </span>
        </div>
      </div>

      {/* Avatar tổ chức */}
      <img
        src={project.avatar}
        alt={`${project.organization} Avatar`}
        className="absolute top-[130px] left-1/2 transform -translate-x-1/2 w-[44px] h-[44px] rounded-full border-2 border-white shadow"
      />

      {/* Nội dung card */}
      <div className="pt-8 px-4 pb-4">
        {/* Tên tổ chức */}
        <h4 className="text-xs font-semibold text-gray-500 text-center mb-1">
          {project.organization}
        </h4>

        {/* Tên dự án */}
        <h3 className="text-[15px] font-bold text-gray-800 text-center mb-2 leading-tight">
          {project.title}
        </h3>

        {/* Progress */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-pink-500"
            style={{ width: project.percentage }}
          />
        </div>

        {/* Raised / Percent */}
        <div className="flex justify-between text-[11px] text-gray-600 mb-2">
          <span>Đã góp: {project.raised} VND</span>
          <span>{project.percentage}</span>
        </div>

        {/* Goal */}
        <p className="text-xs text-gray-500 mb-4 text-center">
          Mục tiêu: {project.goal}
        </p>

        {/* Nút chi tiết */}
        <div className="flex justify-center">
          <Link to={`/campaign/${project.id}`}>
            <button className="text-sm font-semibold text-blue-600 hover:underline">
              Xem chi tiết →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
