#
# Copyright (C) 2017 The Android Open Source Project
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

batches = 2
units = 16
input_size = 8

model = Model()

input = Input("input", "TENSOR_FLOAT32", "{%d, %d}" % (batches, input_size))
weights = Input("weights", "TENSOR_FLOAT32", "{%d, %d}" % (units, input_size))
recurrent_weights = Input("recurrent_weights", "TENSOR_FLOAT32", "{%d, %d}" % (units, units))
bias = Input("bias", "TENSOR_FLOAT32", "{%d}" % (units))
hidden_state_in = Input("hidden_state_in", "TENSOR_FLOAT32", "{%d, %d}" % (batches, units))

activation_param = Int32Scalar("activation_param", 1)  # Relu

hidden_state_out = IgnoredOutput("hidden_state_out", "TENSOR_FLOAT32", "{%d, %d}" % (batches, units))
output = Output("output", "TENSOR_FLOAT32", "{%d, %d}" % (batches, units))

model = model.Operation("RNN", input, weights, recurrent_weights, bias, hidden_state_in,
                        activation_param).To([hidden_state_out, output])

input0 = {
    weights: [
        0.461459,    0.153381,   0.529743,    -0.00371218, 0.676267,   -0.211346,
       0.317493,    0.969689,   -0.343251,   0.186423,    0.398151,   0.152399,
       0.448504,    0.317662,   0.523556,    -0.323514,   0.480877,   0.333113,
       -0.757714,   -0.674487,  -0.643585,   0.217766,    -0.0251462, 0.79512,
       -0.595574,   -0.422444,  0.371572,    -0.452178,   -0.556069,  -0.482188,
       -0.685456,   -0.727851,  0.841829,    0.551535,    -0.232336,  0.729158,
       -0.00294906, -0.69754,   0.766073,    -0.178424,   0.369513,   -0.423241,
       0.548547,    -0.0152023, -0.757482,   -0.85491,    0.251331,   -0.989183,
       0.306261,    -0.340716,  0.886103,    -0.0726757,  -0.723523,  -0.784303,
       0.0354295,   0.566564,   -0.485469,   -0.620498,   0.832546,   0.697884,
       -0.279115,   0.294415,   -0.584313,   0.548772,    0.0648819,  0.968726,
       0.723834,    -0.0080452, -0.350386,   -0.272803,   0.115121,   -0.412644,
       -0.824713,   -0.992843,  -0.592904,   -0.417893,   0.863791,   -0.423461,
       -0.147601,   -0.770664,  -0.479006,   0.654782,    0.587314,   -0.639158,
       0.816969,    -0.337228,  0.659878,    0.73107,     0.754768,   -0.337042,
       0.0960841,   0.368357,   0.244191,    -0.817703,   -0.211223,  0.442012,
       0.37225,     -0.623598,  -0.405423,   0.455101,    0.673656,   -0.145345,
       -0.511346,   -0.901675,  -0.81252,    -0.127006,   0.809865,   -0.721884,
       0.636255,    0.868989,   -0.347973,   -0.10179,    -0.777449,  0.917274,
       0.819286,    0.206218,   -0.00785118, 0.167141,    0.45872,    0.972934,
       -0.276798,   0.837861,   0.747958,    -0.0151566,  -0.330057,  -0.469077,
       0.277308,    0.415818
    ],
    recurrent_weights: [
        0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0.1
    ],
    bias: [
        0.065691948, -0.69055247, 0.1107955, -0.97084129, -0.23957068,
        -0.23566568, -0.389184, 0.47481549, -0.4791103, 0.29931796,
        0.10463274, 0.83918178, 0.37197268, 0.61957061, 0.3956964,
        -0.37609905
    ],
}

input0[input] = [
  -0.69424844, -0.93421471, -0.87287879, 0.37144363,
  -0.62476718, 0.23791671, 0.40060222, 0.1356622,
  -0.69424844, -0.93421471, -0.87287879, 0.37144363,
  -0.62476718, 0.23791671, 0.40060222, 0.1356622,
]
input0[hidden_state_in] = [
  0.496726, 0, 0.965996, 0,
  0.0584256, 0, 0, 0.12315,
  0, 0, 0.612267, 0.456601,
  0, 0.52286, 1.16099, 0.0291233,
  0.496726, 0, 0.965996, 0,
  0.0584256, 0, 0, 0.12315,
  0, 0, 0.612267, 0.456601,
  0, 0.52286, 1.16099, 0.0291233,
]
output0 = {
  hidden_state_out : [
  0, 0, 0.524902, 0,
  0, 0, 0, 1.02116,
  0, 1.35762, 0, 0.356909,
  0.436415, 0.0355731, 0, 0,
  0, 0, 0.524902, 0,
  0, 0, 0, 1.02116,
  0, 1.35762, 0, 0.356909,
  0.436415, 0.0355731, 0, 0,
  ]
}
output0[output] = [
  0,          0,          0.524901,  0,         0,         0,
  0,          1.02116,    0,         1.35762,   0,         0.356909,
  0.436415,   0.0355727,  0,         0,

  0,          0,          0.524901,  0,         0,         0,
  0,          1.02116,    0,         1.35762,   0,         0.356909,
  0.436415,   0.0355727,  0,         0,
]

Example((input0, output0))
