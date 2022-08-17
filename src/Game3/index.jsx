import Game from "./main";

const game3 = () => {
  // <div id="phaser"></div> 는 Scene에 ButtonJSX 적용을 위해 작성
  return (
    <>
      <div id="phaser"></div>
      <script src="jsx-dom-shim.ts"></script>
      <script src="main.ts"></script>
    </>
  );
};
export default game3;
