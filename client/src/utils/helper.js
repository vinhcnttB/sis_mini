// Các hàm hỗ trợ
export const helper = {
  isPositiveNumber(value) {
    // Kiểm tra xem chuỗi chỉ chứa các ký tự số
    var numberPattern = /^[0-9]+$/;
    if (!numberPattern.test(value)) {
      return false; // Không phải là số hoặc chứa ký tự không phải số
    }

    // Chuyển đổi chuỗi thành số và kiểm tra xem số đó có lớn hơn 0 hay không
    var number = parseFloat(value);
    return number > 0;
  },
};
