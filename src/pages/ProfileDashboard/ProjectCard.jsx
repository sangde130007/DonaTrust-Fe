import React from 'react';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project, index }) => {
  const categoryColors = {
    'Children': 'bg-global-4',
    'Environment': 'bg-global-4'
  };

  return (
    <div className="relative w-[187px] h-[137px]">
      {/* Project Image */}
      <div className="relative w-[137px] h-[104px]">
        <img 
          src={project.image} 
          alt={project.title}
          className="w-full h-full object-cover rounded-[2px]"
        />
        {/* Category Badge */}
        <div className={`absolute top-[4px] right-[4px] ${categoryColors[project.category] || 'bg-global-4'} px-2 py-1 rounded`}>
          <span className="text-[4px] font-inter font-semibold text-global-8 leading-[5px]">
            {project.category}
          </span>
        </div>
      </div>

      {/* Project Details Card */}
      <div className="absolute top-[98px] left-[11px] w-[118px] h-[89px] bg-global-2 rounded-[2px] shadow-[0px_2px_5px_#abbed166] p-3">
        <h4 className="text-[4px] font-inter font-semibold text-global-6 leading-[5px] text-center mb-2">
          {project.organization}
        </h4>
        <h3 className="text-[7px] font-inter font-semibold text-global-3 leading-[9px] text-center mb-2">
          {project.title}
        </h3>
        
        {/* Progress Bar */}
        <div className="w-[91px] h-[11px] mb-1">
          <img 
            src="/images/img_rectangle_1.png" 
            alt="Progress Bar" 
            className="w-full h-full"
          />
        </div>
        
        {/* Progress Info */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-[4px] font-inter font-semibold text-global-6 leading-[5px]">
            {project.raised}
          </span>
          <span className="text-[4px] font-inter font-semibold text-global-6 leading-[5px]">
            {project.percentage}
          </span>
        </div>
        
        <p className="text-[4px] font-inter font-semibold text-global-6 leading-[5px] mb-2">
          with the goal of {project.goal}
        </p>
        
        {/* Detail Link */}
        <Link 
          to={`/campaign/${project.id}`}
          className="flex items-center justify-center"
        >
          <span className="text-[6px] font-inter font-semibold text-global-5 leading-[9px] mr-1">
            Detail
          </span>
          <img 
            src="/images/img_24_arrows_directions_right.svg" 
            alt="Arrow Right" 
            className="w-2 h-2"
          />
        </Link>
      </div>

      {/* Organization Avatar */}
      <img 
        src={project.avatar} 
        alt={`${project.organization} Avatar`}
        className="absolute top-[86px] left-[61px] w-[21px] h-5 rounded-[10px]"
      />
    </div>
  );
};

export default ProjectCard;