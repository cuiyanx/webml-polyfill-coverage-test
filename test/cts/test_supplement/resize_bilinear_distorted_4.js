describe('CTS Supplement Test', function() {
  const assert = chai.assert;
  const nn = navigator.ml.getNeuralNetworkContext();

  it('check result for Resize bilinear with inputs (without align_corners) distorted example/4', async function() {
    let model = await nn.createModel(options);
    let operandIndex = 0;

    let op1_value = [1, 3, 5, 7, 9, 11, 13, 15, 1, 3, 5, 7, 9, 11, 13, 15, 1, 3, 5, 7, 9, 11, 13, 15, 1, 3, 5, 7, 9, 11, 13, 15];
    let op2_expect = [1, 3, 3.6666667, 5.666667, 5, 7, 6.333333, 8.333333, 9, 11, 10.333333, 12.333333, 6.333334, 8.333334, 9.000001, 11.000001, 10.333334, 12.333334, 1, 3, 3.6666667, 5.666667, 5, 7, 6.333333, 8.333333, 9, 11, 10.333333, 12.333333, 6.333334, 8.333334, 9.000001, 11.000001, 10.333334, 12.333334];

    let type2 = {type: nn.INT32};
    let type0 = {type: nn.TENSOR_FLOAT32, dimensions: [2, 4, 2, 2]};
    let type0_length = product(type0.dimensions);
    let type1 = {type: nn.TENSOR_FLOAT32, dimensions: [2, 3, 3, 2]};
    let type1_length = product(type1.dimensions);

    let op1 = operandIndex++;
    model.addOperand(type0);
    let op2 = operandIndex++;
    model.addOperand(type1);
    let height = operandIndex++;
    model.addOperand(type2);
    let width = operandIndex++;
    model.addOperand(type2);

    model.setOperandValue(height, new Int32Array([3]));
    model.setOperandValue(width, new Int32Array([3]));
    model.addOperation(nn.RESIZE_BILINEAR, [op1, height, width], [op2]);

    model.identifyInputsAndOutputs([op1], [op2]);
    await model.finish();

    let compilation = await model.createCompilation();
    compilation.setPreference(getPreferenceCode(options.prefer));
    await compilation.finish();

    let execution = await compilation.createExecution();

    let op1_input = new Float32Array(op1_value);
    execution.setInput(0, op1_input);

    let op2_output = new Float32Array(type1_length);
    execution.setOutput(0, op2_output);

    await execution.startCompute();

    for (let i = 0; i < type1_length; ++i) {
      assert.isTrue(almostEqualCTS(op2_output[i], op2_expect[i]));
    }
  });
});
