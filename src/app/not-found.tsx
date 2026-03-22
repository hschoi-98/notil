export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
        <p className="text-gray-500 mb-6">페이지를 찾을 수 없습니다.</p>
        <a href="/" className="text-sm text-blue-600 hover:underline">홈으로 돌아가기</a>
      </div>
    </div>
  );
}
