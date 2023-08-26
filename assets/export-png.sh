#!/usr/bin/env sh
cd background
mkdir -p png
for file in *.svg; do
	inkscape --export-filename=png/${file%.*}.png --export-width=1920 $file
done

cd ../canopy
mkdir -p png
for file in *.svg; do
	inkscape --export-filename=png/${file%.*}.png --export-width=1920 $file
done

cd ../inkling
mkdir -p png
for file in *.svg; do
	inkscape --export-filename=png/${file%.*}.png --export-width=1920 $file
done