export default function Footer() {
  return (
    <footer className="bg-[#0f172a] border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-rose-600 mb-4 inline-block">
              Xemphim
            </span>
            <p className="text-slate-400 max-w-sm">
              Trải nghiệm điện ảnh đỉnh cao với hệ thống đặt vé trực tuyến nhanh chóng, tiện lợi.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Hỗ Trợ</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Điều khoản sử dụng</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Câu hỏi thường gặp</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Kết Nối</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Facebook</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Instagram</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Twitter</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-slate-500">
          <p>&copy; {new Date().getFullYear()} Xemphim. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
