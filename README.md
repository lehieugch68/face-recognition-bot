Bot Discord nhận diện và phân tích khuôn mặt dựa trên [face-api.js](https://github.com/justadudewhohacks/face-api.js/).

Yêu cầu: [discord.js](https://github.com/discordjs/discord.js/), [face-api.js](https://github.com/justadudewhohacks/face-api.js/) và [tensorflow/tfjs-node](https://github.com/tensorflow/tfjs-node) (không bắt buộc).

```
npm install discord.js
npm install tensorflow@tfjs-node
npm install face-api.js
```

Do TensorFlow thực thi đồng bộ (chặn luồng chính của NodeJS) nên mình sử dụng Child Process cho việc xử lý hình ảnh, hiệu suất kém hơn vì phải load lại các Model mỗi lần thực hiện.

Nếu bạn chỉ muốn Bot tập trung vào việc phân tích khuôn mặt và quan tâm đến hiệu suất, có thể bỏ phần code của Child Process (toàn bộ tác vụ khác sẽ tạm dừng cho đến khi xử lý ảnh xong).
