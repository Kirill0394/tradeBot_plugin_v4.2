function multiplyArray(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] *= DEFAULT_START;
  }
  return arr;
}