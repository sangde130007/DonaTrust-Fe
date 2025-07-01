import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Button from '../../components/ui/Button';
import ProjectCard from './ProjectCard';
import ProfileStats from './ProfileStats';

const ProfileDashboard = () => {
  // Mock data for supported projects
  const supportedProjects = [
    {
      id: 1,
      title: 'Supporting students to go to school in 2025',
      organization: 'Quỹ Vì trẻ em khuyết tật Việt Nam',
      category: 'Children',
      image: '/images/img_image_18.png',
      avatar: '/images/img_ellipse_8_20x21.png',
      raised: '9.720.000',
      percentage: '32.4%',
      goal: '30,000,000 VND'
    },
    {
      id: 2,
      title: 'Supporting students to go to school in 2025',
      organization: 'Quỹ Vì trẻ em khuyết tật Việt Nam',
      category: 'Children',
      image: '/images/img_image_18_104x137.png',
      avatar: '/images/img_ellipse_8_20x21.png',
      raised: '9.720.000',
      percentage: '32.4%',
      goal: '30,000,000 VND'
    },
    {
      id: 3,
      title: 'Green Forest Up 2025',
      organization: 'Trung tâm Con người và Thiên nhiên',
      category: 'Environment',
      image: '/images/img_image_18_3.png',
      avatar: '/images/img_ellipse_8_1.png',
      raised: '9.720.000',
      percentage: '32.4%',
      goal: '30,000,000 VND'
    }
  ];

  return (
    <div className="min-h-screen bg-global-3 shadow-[-24px_-28px_140px_#00000019]">
      <Header />
      
      <main className="relative">
        {/* Hero Background Section */}
        <div className="relative w-full h-[422px]">
          {/* Background Image */}
          <div 
            className="absolute top-0 left-0 w-full h-[349px] bg-cover bg-center"
            style={{ backgroundImage: `url('/images/img__1.png')` }}
          >
            {/* Image Icon Overlay */}
            <div className="absolute top-[316px] right-[40px]">
              <img 
                src="/images/img_24_user_interface_image.svg" 
                alt="Edit Background" 
                className="w-6 h-6 rounded-[5px] cursor-pointer"
              />
            </div>
          </div>

          {/* Profile Section */}
          <div className="absolute top-[306px] left-[140px]">
            {/* Profile Avatar */}
            <div className="relative">
              <img 
                src="/images/img_ellipse_43.png" 
                alt="Profile Avatar" 
                className="w-[95px] h-[95px] rounded-[47px]"
              />
              <img 
                src="/images/img_24_user_interface_logout_white_a700.svg" 
                alt="Edit Profile" 
                className="absolute bottom-0 right-0 w-6 h-6 rounded-[12px] cursor-pointer"
              />
            </div>
          </div>

          {/* Profile Info Section */}
          <div className="absolute top-[353px] left-[243px] w-[674px] h-[69px]">
            <div 
              className="w-full h-full bg-cover bg-center flex items-center justify-between px-8"
              style={{ backgroundImage: `url('/images/img_image_20.png')` }}
            >
              <div className="flex-1">
                <h1 className="text-xl font-inter font-bold text-global-8 mb-2">
                  Dat Nguyen Tien
                </h1>
                <p className="text-sm font-inter font-normal text-global-6">
                  @datnguyentien09
                </p>
                <div className="flex items-center mt-2 space-x-4">
                  <span className="text-sm font-inter font-normal text-global-6">
                    0 followers
                  </span>
                  <span className="text-sm font-inter font-normal text-global-6">
                    0 article
                  </span>
                </div>
              </div>
              
              <Link to="/profile/edit">
                <Button 
                  variant="primary" 
                  size="custom"
                  className="w-[123px] h-[31px] text-xs"
                >
                  Edit inforrmation
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Statistics */}
        <ProfileStats />

        {/* Supported Projects Section */}
        <section className="mt-[11px] px-[168px]">
          <h2 className="text-xl font-inter font-bold text-global-1 text-center mb-8">
            The project has supported
          </h2>
          
          {/* Projects Grid */}
          <div className="flex justify-center space-x-[18px] mb-[24px]">
            {supportedProjects.map((project, index) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                index={index}
              />
            ))}
          </div>

          {/* Explore More Button */}
          <div className="flex justify-center">
            <Link to="/campaigns">
              <Button 
                variant="primary" 
                size="custom"
                className="w-[222px] h-[31px] text-xs"
              >
                Explore fundraising campaigns
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <div className="mt-[146px]">
        <Footer />
      </div>
    </div>
  );
};

export default ProfileDashboard;