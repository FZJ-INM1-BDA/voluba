[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

# voluba - interactive alignment of volumes of interest to high-resolution brain reference models

X. Gui, Y. Leprince, P. Chervakov, T. Dickscheid, D. Gogshelidze

*Copyright 2017-2024 [Big Data Analytics Group](https://www.fz-juelich.de/en/inm/inm-1/research/big-data-analytics), [Institute of Neuroscience and Medicine (INM-1)](https://www.fz-juelich.de/en/inm/inm-1), [Forschungszentrum Jülich](https://www.fz-juelich.de/en)*


"voluba" is an acronym for **Volu**metric **B**rain **A**nchoring. 
It is a browser based tool for interactive alignment of volumes of interest from brain imaging experiments with a high-resolution 3D reference brain model.

![screenshot](user_docs/images/teaser.png)

Spatial anchoring of high-resolution volumes of interest (VOIs) from specific imaging experiments into the detailed anatomical context of a high-resolution reference model like [BigBrain](https://search.kg.ebrains.eu/instances/Dataset/d07f9305-1e75-4548-a348-b155fb323d31) is a practical problem due to the size of many high-resolution volumes (BigBrain is one Terabyte of data!), and the lack of automatic methods for image alignment with partial volumetric datasets.
The main idea behind voluba is to allow interactive alignment to microscopic resolution 3D image volumes without downloading them to a local computer.
Instead, voluba allows to upload your own volume of interest - which is typically significantly smaller - to a private space on the server, perform the interactive image alignment in your web browser, and retrieve the resulting parameters of the spatial alignment. The dataset will be linked to your ORCID id and not be shared or exposed to anybody else.

voluba offers a highly interactive workflow. 
First, you log in with their ORCID or EBRAINS account to upload a dataset into your private working space for the anchoring process. 
You can choose three different reference volumes: the microscopic resolution human brain model ["BigBrain"](https://search.kg.ebrains.eu/instances/Dataset/d07f9305-1e75-4548-a348-b155fb323d31), the Waxholm space template of the Sprague Dawley rat, and the Allen mouse brain.
The input volume is presented as a graphical overlay in a 3D view with orthogonal cross sections, and you can optimize the visualization by customizing contrast, brightness, colormaps, and intensity thresholds. 
You can then directly manipulate the relative position and orientation of the input volume with your mouse point, and adjust of voxel scaling and axis orientations to obtain a rigid transformation. 
Then, you can use voluba's 3D landmark editor to refine the transformation by specifying pairs of corresponding points between the volumes, further facilitated by an optional side-by-side view. 
The landmarks enable a recalculation of the linear transformation matrix with additional degrees of freedom, including shearing. 
Alignment actions can be performed and repeated in arbitrary order, supported through a history browser which allows to undo individual anchoring steps. 

You can download the resulting transformation parameters in json format, open the aligned image can be in the atlas viewer [siibra-explorer](https://atlases.ebrains.eu/viewer/go/bigbrain) to see it in the anatomical context of the [EBRAINS human brain atlas](https//ebrains.eu/services/atlases), and also obtain a private URL to your anchored image that you can share with colleagues. 

## Technical details 

voluba requires `node >= 20` and `python >= 3.8`. To run a local development instance, do

```bash
npm -C frontend/ i && npm -C frontend/ start
```

voluba uses [Angular](https://angular.io/) for the frontend and [FastAPI](https://fastapi.tiangolo.com/) for the backend.

Building on the [neuroglancer](https://github.com/google/neuroglancer) technology, it allows to interact with very large image volumes.

It has been developed in the [Human Brain Project](https://humanbrainproject.eu) as an online service for integration of image data to brain atlases within the [EBRAINS](https://ebrains.eu) infrastructure for brain research.

It has been designed as a service of the [EBRAINS](https://ebrains.eu) infrastructure for brain research and developed in the [Human Brain Project](https://humanbrainproject.eu). 
voluba has received funding from the European Union’s Horizon 2020 Framework Programme for Research and Innovation under the Specific Grant Agreement No. 945539 (Human Brain Project SGA3).

![logo](user_docs/images/HBP_EBRAINS_logo.png)

