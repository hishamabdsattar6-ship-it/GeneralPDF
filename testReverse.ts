import { customReshape } from './src/utils/arabicReshaperLogic';

async function run() {
  const text = customReshape("مرحبا بالعالم أنا هنا");
  const reversed = text.split('').reverse().join('');
  console.log("Original   :", "مرحبا بالعالم أنا هنا");
  console.log("Reshaped   :", text);
  console.log("Reversed   :", reversed);
}
run();
