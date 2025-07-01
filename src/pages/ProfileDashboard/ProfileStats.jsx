import React from 'react';

const ProfileStats = () => {
  const stats = [
    {
      label: 'Project',
      value: '3',
      color: 'text-global-21'
    },
    {
      label: 'Organization',
      value: '0',
      color: 'text-global-21'
    },
    {
      label: 'Amount of donation',
      value: '950,000 VND',
      color: 'text-global-21'
    }
  ];

  return (
    <div className="w-[494px] h-[145px] mt-[35px] ml-[245px]">
      <img 
        src="/images/img_image_23.png" 
        alt="Profile Statistics Background" 
        className="w-full h-full object-cover"
      />
      <div className="absolute top-[502px] left-[245px] w-[494px] h-[145px] flex items-center justify-center">
        <div className="flex justify-around w-full px-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-xs font-inter font-normal text-global-6 mb-1">
                {stat.label}
              </p>
              <p className={`text-2xl font-inter font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;