// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     <https://www.apache.org/licenses/LICENSE-2.0>
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use strict";

require("regenerator-runtime/runtime");

const doxbee = require("../build/doxbee-async-babel.js");
const measure = require("../build/measure-async-babel.js");

(async () => {
  try {
    const time = await measure(doxbee, "b", "c");
    console.log(JSON.stringify({"benchmark": "doxbee-async-es2017-babel", time}));
  } catch (err) {
    console.error(err);
  }
})();
