import styled from "styled-components";

export const ToggleBall = styled.div`
  width: 20px;
  height: 20px;
  /* background-color: ${(props) => props.theme.textColor}; */
  background-color: #fff;
  position: absolute;
  border-radius: 50%;
  transition: transform 0.2s linear;
`;

export const ToggleButton = styled.div`
  margin: 1rem;
  margin-top: 10px;
  margin-bottom: 10px;
  float: right;
  display: block;
  width: fit-content;
  cursor: pointer;

  > * {
    box-sizing: border-box;
  }

  > input {
    opacity: 0;
    cursor: pointer;
    position: absolute;
  }

  .label {
    width: 50px;
    height: 26px;
    /* border: 1px solid ${(props) => props.theme.textColor}; */
    /* background-color: ${(props) => props.theme.background}; */
    cursor: pointer;
    background-color: ${(props) => props.theme.togglerColor};
    display: flex;
    border-radius: 50px;
    align-items: center;
    justify-content: space-between;
    padding: 5px;
    position: relative;
    transform: scale(1.5);
  }

  /*  target the elemenent after the label*/
  .themeToggleInput:checked + .label ${ToggleBall} {
    transform: translateX(24px);
  }

  .fa-moon {
    color: pink;
  }

  .fa-sun {
    color: yellow;
  }
`;