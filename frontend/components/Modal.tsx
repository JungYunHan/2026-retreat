"use client";

interface ModalProps {
  title: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  showConfirmButton?: boolean;
}

export default function Modal({
  title,
  message,
  type = "info",
  isOpen,
  onClose,
  onConfirm,
  confirmText = "확인",
  showConfirmButton = false,
}: ModalProps) {
  if (!isOpen) return null;

  const bgColor = {
    success: "bg-green-900 border-green-700",
    error: "bg-red-900 border-red-700",
    warning: "bg-yellow-900 border-yellow-700",
    info: "bg-blue-900 border-blue-700",
  }[type];

  const headerBg = {
    success: "bg-green-800",
    error: "bg-red-800",
    warning: "bg-yellow-800",
    info: "bg-blue-800",
  }[type];

  const iconColor = {
    success: "text-green-400",
    error: "text-red-400",
    warning: "text-yellow-400",
    info: "text-blue-400",
  }[type];

  const icon = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  }[type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className={`${bgColor} border rounded-lg shadow-2xl w-full max-w-sm overflow-hidden`}>
        {/* 헤더 */}
        <div className={`${headerBg} px-4 py-3 flex items-center gap-2`}>
          <div className={`text-xl font-bold ${iconColor}`}>{icon}</div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>

        {/* 본문 */}
        <div className="px-4 py-4">
          <p className="text-gray-200 whitespace-pre-wrap text-sm">{message}</p>
        </div>

        {/* 버튼 영역 */}
        <div className="px-4 py-3 bg-black bg-opacity-30 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md transition-colors font-medium text-sm"
          >
            닫기
          </button>
          {showConfirmButton && onConfirm && (
            <button
              onClick={onConfirm}
              className={`px-3 py-1.5 rounded-md transition-colors font-medium text-white text-sm ${
                type === "error"
                  ? "bg-red-600 hover:bg-red-700"
                  : type === "success"
                  ? "bg-green-600 hover:bg-green-700"
                  : type === "warning"
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
