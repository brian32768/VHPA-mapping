#!/usr/bin/env python

import sys, os
import re
import json

re_newline = re.compile(r'^(.*?)\r?\n?$') # used to remove either dos or unix newline

filename = 'cb.txt'
output = 'cb.geojson'

try :
    f = open(filename, 'r')
except :
    print("Can't open %s" % filename)
    sys.exit(-1)

# first line contains field names
m = re_newline.match(f.readline())
line = m.group(1)
#print line
fields = line.split("\t")

# scrub the attributes we don't need
savefields = ['LAT','LONG', 'SHORT_FORM', 'FULL_NAME_RO']

linecounter = 0
placecounter = 0
features = []
for txt in f:
    m = re_newline.match(txt)
    line = m.group(1)
    row = line.split("\t")
    
    # Convert values that we want from row into a dictionary
    allattrib = {}
    i = 0
    for item in fields:
        allattrib[item] = row[i]
        i += 1
        
    # Currently we only care about populated places
    if allattrib['FC'] == 'P':
    
        savedattrib = {}
        for item in savefields:
            savedattrib[item] = allattrib[item]
        #print allattrib
        # float causes output w/o quotes. Quoted latlon not allowed in GeoJSON!
        coordinates = [float(savedattrib['LONG']), float(savedattrib['LAT']) ]
        
        geometry = {'type':'Point', 'coordinates': coordinates}
        features.append({'type':'Feature', 'geometry':geometry, 'properties':savedattrib})
        
        placecounter += 1
    
    linecounter += 1
    #if linecounter > 3: break # uncomment for debugging

print("%d lines processed, %d features in output." % (linecounter, placecounter))

print("Encoding..")
rows = { 'type':'FeatureCollection', 'features':features}
# just one line turns the entire dictionary into GeoJSON

# compact option, this takes least amount of space, squeezes out whitespace
encoded = json.dumps(rows, sort_keys=False, separators=(',',':'))
# prettyprint option, this takes time
#encoded = json.dumps(rows, sort_keys=False, indent=4)

print("Writing output..")
f = open(output, 'w')
f.write(encoded)
f.close()

print("Done!")
sys.exit(0)