const restrictedAreas = [
    { x: 100, y: 100, width: 200, height: 150 },
  ];

document.addEventListener("keypress", () => {
  console.log("CCFCFCFCFCFCFCFCFCFCFFCF");
});
function isInRestrictedArea(x, y) {
    return restrictedAreas.some((area) => {
      const isInArea =
        !(x <= area.x ||
        x >= area.x+area.width) &&
        (y <= area.y ||
        y >= area.y + area.height);
    
    
  
      if (isInArea) {
        console.log(
          `Coordinates (${x}, ${y}) are in restricted area: ${JSON.stringify(
            area
          )}`
        );
      }
  
      return isInArea;
});
}

console.log(isInRestrictedArea(50,50))
console.log(isInRestrictedArea(150,250))
