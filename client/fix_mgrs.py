#!/usr/bin/python
#
# Read the spreadsheet (saved in CSV)
# Convert MGRS to latlon
# Write a GeoJSON file
#
#  Does a few other things too, read the code
#
import sys, os
import re
import csv
import json

import mgrs # see https://github.com/hobu/mgrs#readme

re_newline = re.compile(r'^(.*?)\r?\n?$') # used to remove either dos or unix newline

#shape_file  = "Hupy data/all_date.geojson" # Used to use this but it's not accurate
table_file  = 'Roush.csv'
picture_table = 'aircraft-pictures.txt' # two columns, aircraft type tab url
output_file = 'crash_data.geojson'

# Create a lookup table to populate the picture column

try:
    f = open(picture_table, 'r')
except:
    print("Can't open %s" % picture_table)
    sys.exit(-1)
pictures={}
for txt in f:
    #print txt
    m = re_newline.match(txt)
    line = m.group(1)
    row = line.split("\t")
    #print row
    if len(row)>1:
        pictures[row[0]] = row[1]
f.close()
print "Pictures %d" % len(pictures)
#sys.exit(0)

#try:
#    sf = open(shape_file, 'r')
#except:
#    print("Can't open %s" % shape_file)
#    sys.exit(-1)
#print "Reading geojson shape file. %s" % shape_file
#d_geojson = json.load(sf)
#sf.close()

# Load in the CSV data
   
try :
    f = open(table_file, 'r')
except :
    print("Can't open %s" % table_file)
    sys.exit(-1)

csv_delimiter = ','
reader = csv.DictReader(f, delimiter=csv_delimiter, quotechar='"')

# This is the list of the attributes we keep
savefields = ['mgrs','url', 'picture', 'short_sum']

linecounter = 0
rowcounter = 0
features = [] # List ready for writing to GeoJSON output
m = mgrs.MGRS() # object to convert MGRS to Lat, Lon

totals = {}
i = 1962
while (i < 1976):
    totals[i] = 0
    i += 1
    
for row in reader:
    linecounter += 1
    #if linecounter > 3: break # uncomment for debugging
    #print linecounter, row, len(row)

    date = '19' + str(row['date']) # change date to match shapefile
    year = date[0:4]
    #print year
    row['year'] = year
    row['date'] = date[0:4] + '-' + date[4:6] + '-' + date[6:8]
    #print row['date']
    
    totals[int(year)] += 1
    
    model = row['model']
    picture = ''
    if pictures.has_key(model):
        picture = pictures[model]
    #print 'model %s picture %s' % (model, picture)
    
    row['picture'] = picture
    
    # change mgrs to match shapefile
    position_mgrs = row['mgrs']
    #print "mgrs = %s" % position_mgrs
    
    try:
        lat,lon = m.toLatLon(position_mgrs)
        #print "ll = ", latlon
    except:
        print "ignoring whacked position '%s':" % position_mgrs
        continue
    
    #hashcode = position_mgrs  + ',' + date + ',' + tail
    #
    #if  events.has_key(hashcode):
    #    print "Event table collision on %s, ignoring this row." % hashcode
    #    print row
    #    print events[hashcode]
    #    print ""
    #    badhash += 1 
    #else:
    #    events[hashcode] = row
    #    rowcounter += 1
    
    # float causes output w/o quotes. Quoted latlon not allowed in GeoJSON!
    coordinates = [float(lon), float(lat) ]
        
    geometry = {'type':'Point', 'coordinates': coordinates}
    
    # delete the columns we don't want in our output file
    del row['uic_code']
    del row['loss_inv']
    del row['grid']
    
    features.append({'type':'Feature', 'geometry':geometry, 'properties':row})
        
    rowcounter += 1

f.close()
print("Table: %d rows processed, %d rows in output." % (linecounter, rowcounter))
print totals

print("Encoding %d features." % len(features))
rows = { 'type':'FeatureCollection', 'features':features}
# just one line turns the entire dictionary into GeoJSON

# compact option, this takes least amount of space, squeezes out whitespace
encoded = json.dumps(rows, sort_keys=False, separators=(',',':'))
# prettyprint option, this takes time
#encoded = json.dumps(rows, sort_keys=False, indent=4)

print("Writing output..")
f = open(output_file, 'w')
f.write(encoded)
f.close()

print("Done!")
sys.exit(0)