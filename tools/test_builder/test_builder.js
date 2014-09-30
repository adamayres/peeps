#!/usr/bin/env node

'use strict';
require('./lib/test_builder_lib').run(process.argv[2], 'tests/').catch(function (err) { console.log(err.stack) });
