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

const cp = require('child_process');
const fs = require('fs');

const BENCHMARKS = fs.readdirSync('src')
  .filter(filename => filename.endsWith('.js'))
  .filter(filename => filename.indexOf("babel") == -1)
  .filter(filename => filename.indexOf("bluebird") == -1)
  .map(filename => `./src/${filename}`);
BENCHMARKS.sort();

const results = {};
const repeat = 10;

function saveTime(benchmark, type, time) {
  const b = results[benchmark] || {};
  const t = b[type] || {};
  const times = t.times || [];
  times.push(time);
  t.times = times;
  b[type] = t;
  results[benchmark] = b;
}

const typeArgs = {
  "baseline": [],
  "with-crash-collector": ["--unhandled-rejections=strict", "--require=../../crash-collector"],
}

function runBenchmark(benchmark, type) {
  const p = cp.spawnSync(process.execPath, typeArgs[type].concat([ benchmark ]));
  if (p.status != 0) {
    console.error(p.stderr.toString());
    process.exit(1);
  }
  result = JSON.parse(p.stdout.toString().trim());
  saveTime(result.benchmark, type, result.time);
}

let result = null;

try {
  for (const benchmark of BENCHMARKS) {
    for (const type in typeArgs) {
      console.log(`Running ${benchmark} / ${type}`);
      for (let i=0; i < repeat; i++) {
        runBenchmark(benchmark, type);
      }
    }
  }
} catch (err) {
  console.error(err);
  process.exit(1);
}

for (let benchmark in results) {
  const table = [];

  for (let type in results[benchmark]) {
    const t = results[benchmark][type];
    const stats = {
      avg: t.times.reduce((a, b) => a + b) / t.times.length,
      min: Math.min(...t.times),
      max: Math.max(...t.times),
    };
    t.stats = stats;
  }

  const baseline = results[benchmark].baseline.stats;

  for (let type in results[benchmark]) {
    console.log(benchmark);
    const stats = results[benchmark][type].stats;
    if (type == "baseline")
      table.push({
        "Type": type,
        "Avg": stats.avg,
        "Min": stats.min,
        "Max": stats.max,
      });
    else
      table.push({
        "Type": type,
        "Avg": `${stats.avg} (${100 * (stats.avg - baseline.avg) / baseline.avg}%)`,
        "Min": `${stats.min} (${100 * (stats.min - baseline.min) / baseline.min}%)`,
        "Max": `${stats.max} (${100 * (stats.max - baseline.max) / baseline.max}%)`,
      });
  }

  console.table(table);
}

fs.writeFileSync("results.json", JSON.stringify(results));
