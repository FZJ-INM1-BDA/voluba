# NIfTI conversion

For personal data voluba only supports the NIfTI-format (.nii or .nii.gz). To convert your data we recommend one of the following tools:

1. [ITK-SNAP](#itk-snap)
2. [3D Slicer](#3d-slicer)
3. [Fiji](#fiji)

## ITK-SNAP

1. Install ITK-SNAP
2. Launch ITK-SNAP
3. Open your file (via File &rightarrow; Open Main Image ...)
4. Save file as NIfTI (via File &rightarrow; Save Image &rightarrow; Main Image ... &rightarrow; Select File Format "NiFTI")

## 3D Slicer

1. Install 3D Slicer 
2. Launch 3D Slicer 
3. Open your file (via File &rightarrow; Add Data OR File &rightarrow; Add DICOM Data &rightarrow; Import DICOM files &rightarrow; Select patient 
4. &rightarrow; Select volume on bottom by double-clicking (Will open view))
5. Save file as NIfTI (via File &rightarrow; Save Data &rightarrow; check the file, under FileFormat select "NifTI (.nii)" or "NifTI (
   .nii.gz)", choose your output directory under Directory)

## Fiji

1. Install Fiji
2. Download NIfTI Plugin (NIfTI_io.jar)
3. Move NIfTI_io.jar to the Fiji plugins folder (Fiji.app/plugins/)
4. Launch Fiji
5. Open your file (via File &rightarrow; Open/Open samples/Import according to filetype)
6. Save file as NIfTI (via File &rightarrow; Save As &rightarrow; NIfTI-1)