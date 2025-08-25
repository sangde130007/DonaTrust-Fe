import React from "react";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";

const OrganizerPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">

      {/* Banner tổ chức */}
      <section className="relative">
        <div
          className="h-[400px] bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=1200&q=80')",
          }}
        ></div>
        <div className="bg-white py-12 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
              <img
                src="/images/img_image_18_1.png"
                alt="Logo"
                className="w-16 h-16 rounded-full"
              />
              <div className="absolute w-3 h-3 bg-red-500 rounded-full top-0 right-2"></div>
            </div>
            <h1 className="text-3xl font-bold">Quỹ Vì Trẻ Em Khuyết Tật Việt Nam</h1>
          </div>
        </div>
      </section>

      {/* Thông tin liên hệ */}
      <section className="py-8 bg-white">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <div className="font-medium">Số điện thoại</div>
            <div className="text-sm text-gray-600">0903 036 500</div>
          </div>

          <div>
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <div className="font-medium">E-mail</div>
            <div className="text-sm text-gray-600">
              contact@childrenof-vietnam.org
            </div>
          </div>

          <div>
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="font-medium">Website</div>
            <div className="text-sm text-gray-600">https://anngiquoctuanho.org</div>
          </div>
        </div>
      </section>

      {/* Giới thiệu */}
      <section className="py-8 bg-gray-50 text-center">
        <div className="max-w-4xl mx-auto px-4 text-gray-700 text-sm leading-relaxed">
          "Qũy vì trẻ em khuyết tật Việt Nam là tổ chức từ thiện duy nhất tại Việt Nam cung cấp
          chuyên môn điều trị y tế và phẫu thuật tiêu chuẩn quốc tế cho trẻ em
          khuyết tật. Với ngọn lửa tình yêu thương vô điều kiện, Quỹ nuôi dưỡng
          sứ mệnh mang đến cơ thể khỏe mạnh và tương lai tốt đẹp cho trẻ em trên
          khắp cả nước."
        </div>
      </section>

      {/* Thống kê */}
      <section className="py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-gray-600 mb-2 text-sm">Dự án</div>
            <div className="text-3xl font-bold text-red-500">32</div>
          </div>
          <div>
            <div className="text-gray-600 mb-2 text-sm">Tình nguyện viên</div>
            <div className="text-3xl font-bold text-blue-500">9</div>
          </div>
          <div>
            <div className="text-gray-600 mb-2 text-sm">Người ủng hộ</div>
            <div className="text-3xl font-bold text-red-500">6,534</div>
          </div>
          <div>
            <div className="text-gray-600 mb-2 text-sm">Số tiền đã quyên góp</div>
            <div className="text-3xl font-bold text-red-500">
              686,947,425 VND
            </div>
          </div>
        </div>
      </section>

      {/* Lời kêu gọi */}
      <section className="py-12 bg-gray-50 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">TRỞ THÀNH TỔ CHỨC GÂY QUỸ</h2>
          <p className="text-gray-600 mb-8 text-sm leading-relaxed">
            Bạn có thể trở thành một tổ chức gây quỹ bằng cách tạo trang gây quỹ
            với mục tiêu và hoạt động từ thiện của riêng mình.
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition duration-200">
            Trở thành tổ chức gây quỹ
          </button>
        </div>
      </section>

    </div>
  );
};

export default OrganizerPage;
