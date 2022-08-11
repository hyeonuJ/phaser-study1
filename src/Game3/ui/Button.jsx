import "jsx-dom";
// jsx-dom 이 jsx를 일반 dom element 로 변경해줌
const primaryButton = (text = "Play") => {
  return <button class="button is-primary is-large">{text}</button>;
};

export default primaryButton;
