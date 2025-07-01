import React from 'react';
import { Link } from 'react-router-dom';
import EditText from '../ui/EditText';

const Footer = () => {
  return (
    <div className="w-full h-[267px] bg-footer-1 mt-[1856px]">
      <div className="flex flex-row w-full h-full">
        <div className="flex flex-col ml-[87px] mt-[47px] w-[270px] h-[144px]">
          <img 
            src="/images/img_footerlogo.png" 
            alt="Footer Logo" 
            className="w-[198px] h-[62px]"
          />
          <p className="text-[9px] font-inter text-footer-1 mt-[17px]">
            Copyright © 2025.
          </p>
          <p className="text-[9px] font-inter text-footer-1 mt-[5px]">
            All rights reserved
          </p>
          <div className="flex flex-row mt-[11px] space-x-4">
            <img src="/images/img_social_icons.svg" alt="Social Icon" className="w-[22px] h-[22px]" />
            <img src="/images/img_social_icons_white_a700.svg" alt="Social Icon" className="w-[22px] h-[22px]" />
            <img src="/images/img_social_icons_white_a700_22x22.svg" alt="Social Icon" className="w-[22px] h-[22px]" />
            <img src="/images/img_social_icons_22x22.svg" alt="Social Icon" className="w-[22px] h-[22px]" />
          </div>
        </div>
        
        <div className="flex flex-col ml-[88px] mt-[46px] w-[64px] h-[138px]">
          <h3 className="text-[13px] font-inter font-semibold text-global-8">Company</h3>
          <Link to="/about" className="text-[9px] font-inter text-footer-1 mt-[16px]">About us</Link>
          <Link to="/blog" className="text-[9px] font-inter text-footer-1 mt-[6px]">Blog</Link>
          <Link to="/contact" className="text-[9px] font-inter text-footer-1 mt-[6px]">Contact us</Link>
          <Link to="/pricing" className="text-[9px] font-inter text-footer-1 mt-[6px]">Pricing</Link>
          <Link to="/testimonials" className="text-[9px] font-inter text-footer-1 mt-[6px]">Testimonials</Link>
        </div>
        
        <div className="flex flex-row ml-[68px] mt-[44px] w-[309px] h-[140px]">
          <div className="flex flex-col w-[76px] h-[115px]">
            <h3 className="text-[13px] font-inter font-semibold text-global-8">Support</h3>
            <Link to="/help" className="text-[9px] font-inter text-footer-1 mt-[16px]">Help center</Link>
            <Link to="/terms" className="text-[9px] font-inter text-footer-1 mt-[6px]">Terms of service</Link>
            <Link to="/legal" className="text-[9px] font-inter text-footer-1 mt-[6px]">Legal</Link>
            <Link to="/privacy" className="text-[9px] font-inter text-footer-1 mt-[6px]">Privacy policy</Link>
          </div>
          
          <div className="flex flex-col ml-[56px] w-[177px] h-[64px]">
            <h3 className="text-[13px] font-inter font-semibold text-global-8">Stay up to date</h3>
            <div className="mt-[16px]">
              <EditText placeholder="Your email address" />
            </div>
          </div>
        </div>
        
        <div className="mt-[170px] ml-[-132px]">
          <Link to="/status" className="text-[9px] font-inter text-footer-1">Status</Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;