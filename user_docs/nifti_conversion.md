# NIfTI conversion

For personal data VoluBA only supports the NIfTI-format (.nii or .nii.gz). To convert your data we recommend one of the following tools:

1. [ITK-SNAP](#itk-snap)
2. [3D Slicer](#3d-slicer)
3. [Fiji](#fiji)

## ITK-SNAP

1. Install ITK-SNAP
2. Launch ITK-SNAP
3. Open your file (via File --> Open Main Image ...)
4. Save file as NIfTI (via File --> Save Image --> Main Image ... --> Select File Format "NiFTI")

## 3D Slicer

1. Install 3D Slicer 
2. Launch 3D Slicer 
3. Open your file (via File --> Add Data OR File --> Add DICOM Data --> Import DICOM files --> Select patient 
4. --> Select volume on bottom by doubleclicking (Will open view))
5. Save file as NIfTI (via File --> Save Data --> check the file, under FileFormat select "NifTI (.nii)" or "NifTI (
   .nii.gz)", choose your ouput direcotry under Directory)

## Fiji

1. Install Fiji
2. Download NIfTI Plugin (NIfTI_io.jar)
3. Move NIfTI_io.jar to the Fiji plugins folder (Fiji.app/plugins/)
4. Launch Fiji
5. Open your file (via File --> Open/Open samples/Import according to filetype)
6. Save file as NIfTI (via File --> Save As --> NIfTI-1)