/**
 * Request and verify microphone access permission from the browser.
 */
export async function requestMicrophonePermission(): Promise<{ granted: boolean; error?: string }> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return {
        granted: false,
        error: 'Trình duyệt không hỗ trợ API thu âm (getUserMedia).',
      };
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop all audio tracks immediately after granting permission
    stream.getTracks().forEach((track) => track.stop());
    return { granted: true };
  } catch (err: any) {
    console.warn('Microphone permission check error:', err);
    let message = 'Chưa được cấp quyền sử dụng Micro.';
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      message = 'Bạn đã từ chối hoặc trình duyệt chặn quyền Micro. Vui lòng bấm vào biểu tượng Micro/Ổ khóa trên thanh địa chỉ URL của trình duyệt và chọn "Cho phép" (Allow).';
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      message = 'Không tìm thấy thiết bị Microphone kết nối với máy tính/iPad của bạn.';
    }
    return { granted: false, error: message };
  }
}
