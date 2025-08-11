#!/usr/bin/env python

import sys, os
import json

input_filename = "provinces_count.geojson"
output_filename = "provinces.geojson"

f = open(input_filename, 'r')
d = json.load(f)
f.close();

print d

properties": { "ogc_fid": 5545, "id": 0.000000, "nam": "AN GIANG", "na2": "VM", "PNTCNT": 23.000000 