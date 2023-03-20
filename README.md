# VoluBA - interactive alignment of volumes of interest to high-resolution brain reference models

X. Gui, Y. Leprince, P. Chervakov, T. Dickscheid

*Copyright 2017-2020 [Big Data Analytics Group](https://www.fz-juelich.de/inm/inm-1/EN/Forschung/Big_Data_Analytics/Big_Data_Analytics_node.html), [Institute of Neuroscience and Medicine (INM-1)](https://www.fz-juelich.de/inm/inm-1/), [Forschungszentrum Jülich](https://www.url.com)*


"VoluBA" is an acronym for **Volu**metric **B**rain **A**nchoring. 
It is a browser based tool for interactive alignment of volumes of interest from brain imaging experiments with a high-resolution 3D reference brain model.
The software is provided under the Apache 2.0 license.

![screenshot](user_docs/images/teaser.png)

Spatial anchoring of high-resolution volumes of interest (VOIs) from specific imaging experiments into the detailed anatomical context of a high-resolution reference model like [BigBrain](https://search.kg.ebrains.eu/instances/Dataset/d07f9305-1e75-4548-a348-b155fb323d31) is a practical problem due to the size of many high-resolution volumes (BigBrain is one Terabyte of data!), and the lack of automatic methods for image alignment with partial volumetric datasets.
The main idea behind VoluBA is to allow interactive alignmnt to microscopic resolution 3D image volumes without downloading them to a local computer.
Instead, VoluBA allows to upload your own volume of interest - which is typically significantly smaller - to a private space on a server, perform the interactive image alignment in your web browser, and retrieve the resulting parameters of the spatial alignment.

In VoluBA, the image alignment is performed by interactive manipulation of the input dataset's position and rotation, flipping of coordinate axes, and entering of 3D landmarks. 
Besides downloading the resulting transformation parameters, the aligned image can be opened in [EBRAINS Interactive Atlas Viewer](https://atlases.ebrains.eu/viewer) to see it in the comprehensive 3D context offered by the [EBRAINS brain atlases](https//ebrains.eu/services/atlases). 
The main installation is hosted at <https://voluba.apps.hbp.eu> and currently setup for anchoring high-resolution volumes of interest (VOIs) to the microscopic resolution human brain model ["BigBrain"](https://search.kg.ebrains.eu/instances/Dataset/d07f9305-1e75-4548-a348-b155fb323d31).

VoluBA requires `node >10`. To run a local development instance, do
```bash
cd app && npm run serve
```
 VoluBA uses [Vue](https://vuejs.org) for the reactive UI layer, [Vuex](https://vuex.vuejs.org/) for state management, and [Bootstrap 4](https://getbootstrap.com/docs/4.0) for layout.
Building on the [neuroglancer](https://github.com/google/neuroglancer) technology, it allows to interact with very large image volumes.
It has been developed in the [Human Brain Project](https://humanbrainproject.eu) as an online service for integration of image data to brain atlases within the [EBRAINS](https://ebrains.eu) infrastructure for brain research.

[![logo](user_docs/images/ebrains-logo-dark.svg)](https://ebrains.eu)

It has been designed as a service of the [EBRAINS](https://ebrains.eu) infrastructure for brain research and developed in the [Human Brain Project](https://humanbrainproject.eu). 
VoluBA has received funding from the European Union’s Horizon 2020 Framework Programme for Research and Innovation under the Framework Partnership Agreement No. 650003 (HBP FPA).

