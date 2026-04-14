export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-black text-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <span className="mb-4 inline-block text-2xl font-black text-white">
              Xemphim
            </span>
            <p className="max-w-sm text-zinc-400">
              Hệ thống đặt vé xem phim trực tuyến, thao tác nhanh, giao diện rõ ràng và theo dõi lịch sử vé dễ dàng.
            </p>
          </div>
          <div>
            <h3 className="mb-4 font-semibold text-white">Hỗ Trợ</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-zinc-400 transition hover:text-red-400">Điều khoản sử dụng</a></li>
              <li><a href="#" className="text-zinc-400 transition hover:text-red-400">Chính sách bảo mật</a></li>
              <li><a href="#" className="text-zinc-400 transition hover:text-red-400">Câu hỏi thường gặp</a></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-semibold text-white">Liên Hệ</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-zinc-400 transition hover:text-red-400">Facebook</a></li>
              <li><a href="#" className="text-zinc-400 transition hover:text-red-400">Instagram</a></li>
              <li><a href="#" className="text-zinc-400 transition hover:text-red-400">Hotline: 1900 9999</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-8 text-center text-zinc-500">
          <p>&copy; {new Date().getFullYear()} Xemphim. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
