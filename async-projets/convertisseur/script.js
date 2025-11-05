document.addEventListener("DOMContentLoaded", () => {
  
  const btnRGBInput = document.getElementById("rgb");
  const btnHexInput = document.getElementById("hex");
  
  const btnRGBOutput = document.getElementById("btnRGBOutput");
  const btnHexOutput = document.getElementById("btnHexOutput");
  
  const input = document.getElementById("input");
  const result = document.getElementById("result");
  
  const background = document.getElementById("container");
  
  const copy = document.getElementById("copy");
  
  let activeMode = "RGB";
  
  
  function setMode(mode) {
  activeMode = mode;

  // Set placeholder depending on mode
  input.placeholder = mode === "RGB" ? "rgb(255,255,255)" : "#FFFFFF";
  result.placeholder = mode === "RGB" ? "version hex ici" : "version rgb ici";

  // Run translation
  mode === "RGB" ? translateToHex(input.value) : translateToRgb(input.value);

  // Update button styles
  btnRGBInput.style.borderBottom = mode === "RGB" ? "2px solid black" : "0px";
  btnRGBOutput.style.borderBottom = mode === "RGB" ? "2px solid black" : "0px";
  btnHexInput.style.borderBottom = mode === "HEX" ? "2px solid black" : "0px";
  btnHexOutput.style.borderBottom = mode === "HEX" ? "2px solid black" : "0px";
}

  
  
  function changeBackground(color) { // Change background according to what is type inside of "input"
      console.log("ACTIVE MODE / " , activeMode)
      if (activeMode === "HEX") {
          console.log("CHANGE FUNcTION");
          console.log(color);
          console.log(typeof color);
          background.style.backgroundColor = "#"+color;
      } if (activeMode === "RGB") {
          console.log("faire foction")
          background.style.backgroundColor = "rgb("+color+")";
      }
  }
  
  
  
  function decimalToHex(number) { 
  
      let allR = [];
      let allQ = [];
      let allD = [number];
      const diviseur = 16;
  
      for (i = 0; i <3; i++) { 
  
          console.log("allD[allD.length - 1] : (d) ",  allD[allD.length - 1])
          let dividende = allD[allD.length - 1]  // transforme en nombre
          
          // Calculation of the quotient
          console.log(" Math.floor(dividende / diviseur) : (q) ",  Math.floor(dividende / diviseur))
          let quotient = Math.floor(dividende / diviseur);
          allQ.push(quotient);
          
          
          // Calculation of the remain
          console.log("dividende - (diviseur * quotient) : (r)" , dividende - (diviseur * quotient))
          let r = dividende - (diviseur * quotient);
          allR.push(r)
      
          allD.push(allQ[allQ.length - 1]) // To continu the calculation with the new value while 
      }
          
      allR = allR.map( x => x +1) // for the index of arrays ..
      allR = [allR[0], allR[1] ] = [allR[1] , allR[0]]; // swipe the 2 value of the result    
      let res =""; 
      let hex = [0, 1 , 2, 3, 4, 5, 6, 7, 8, 9, "A", "B", "C", "D", "E", "F" ];
      for (i=0; i<allR.length;i++){
          res += hex[allR[i] - 1]
      }
      return res // The Hex value to display
  }
  
  
  function translateToHex(){ // Display the the result of decimalToHex()
  
      let rgbInput = input.value;
      if (rgbInput === "" ){ //a refaire
          result.value = "code invalid"
      };
  
      let rgb = rgbInput.split(",");
      let hex = '#' + rgb.map(decimalToHex).join('');
      result.value = hex;
      changeBackground(rgbInput)
  };
  
  
  
  function hexToDecimal(number) {
      
      let hex = ["0", "1" , "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F" ];
      console.log(number)
  
      n1 = number[0];
      n2 = number[1];
  
      res1 = hex.indexOf(n1);
      res2 = hex.indexOf(n2);
      
      console.log(res1, res2)
      res1 = res1 * 16 **1
      res2 = res2 * 16 ** 0
      console.log(res1, res2)
      if (res1 === -1) {
          res1 = 0
      }else if (res2 === -1) {
          res2 = 0
      };
      res = res1 + res2
      return res;
  }
  
  
  function translateToRgb() { // Display the result of hexToDecimal()
  
      let hex = input.value;
      if (hex[0] === "#"){
          console.log("diesz")
          hex = hex.slice(1)
      }
      changeBackground(hex); // Never a "#" come in
      let hexT = []
      hexT.push(hex[0] + hex[1])
      hexT.push(hex[2] + hex[3])
      hexT.push(hex[4] + hex[5])
  
      console.log("HexT : ",hexT)
      console.log("hex : ",hex)
  
      let res = "";
      for (i =0; i < hexT.length; i++) {
          console.log("et une boucle")
          console.log(hexT[i])
          res += hexToDecimal(hexT[i]) + ",";
      };
      res = res.slice(0, -1) // Remove the last ","
      result.value = res;
  };
  
  
  setMode("RGB"); // For init
  
  
  btnRGBInput.addEventListener("click", function() {
      setMode("RGB")    
  });
  btnRGBOutput.addEventListener("click", function() {
      setMode("RGB")
  })
  
  
  btnHexInput.addEventListener("click", function() {
      setMode("HEX")    
  });
  btnHexOutput.addEventListener("click", function() {
      setMode("HEX")
  })
  
  
  function updateTranslation() {
    if (activeMode === "RGB") translateToHex();
    else translateToRgb();
  }

  input.addEventListener("input", updateTranslation);
  input.addEventListener("keydown", updateTranslation);
  
  
  copy.addEventListener("click", function(event) {
    // Prevents the default behavior (optional, in case you don't want normal Ctrl+C or default button actions)
    event.preventDefault();
  
    // Copies the content of 'result.value' to the clipboard
    navigator.clipboard.writeText(result.value)
      .then(() => console.log("Text copied:", result.value))
      .catch(err => console.error("Failed to copy:", err));
  });
  
  document.addEventListener("keydown", function(event) {
    // Checks if the user pressed Ctrl+C (or Cmd+C on Mac)
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") {
      // Prevents the default copy behavior (optional)
      event.preventDefault();
  
      // Copies the content of 'result.value' to the clipboard
      navigator.clipboard.writeText(result.value)
        .then(() => console.log("Text copied:", result.value))
        .catch(err => console.error("Failed to copy:", err));
    }
  });
});
