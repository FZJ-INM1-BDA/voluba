# VoluBA User Documentation

"VoluBA" is an acronym for **Volu**metric **B**rain **A**nchoring. 
It is a browser based tool for interactive alignment of volumes of interest from brain imaging experiments with a high-resolution 3D reference brain model.
The main idea behind VoluBA is to allow to interact with microscopic resolution 3D image volumes without downloading them to a local computer, since they can easily reach or exceed the Terabyte size. 
Instead, VoluBA allows to upload your own volume of interest - which is typically significantly smaller - to a private space on a server, perform the interactive image alignment in your web browser, and retrieve the resulting parameters of the spatial alignment.

In VoluBA, the image alignment is performed by interactive manipulation of the input dataset's position and rotation, flipping of coordinate axes, and entering of 3D landmarks. 
Besides downloading the resulting transformation parameters, the aligned image can be opened in [EBRAINS Interactive Atlas Viewer](https://atlases.ebrains.eu/viewer) to see it in the comprehensive 3D context offered by the [EBRAINS brain atlases](https//ebrains.eu/services/atlases). 
The main installation is hosted at <https://voluba.apps.hbp.eu> and currently setup for anchoring high-resolution volumes of interest (VOIs) to the microscopic resolution human brain model ["BigBrain"](https://search.kg.ebrains.eu/instances/Dataset/d07f9305-1e75-4548-a348-b155fb323d31).

VoluBA has been developed in the [Human Brain Project](https://humanbrainproject.eu) as an online service for integration of image data to brain atlases within the [EBRAINS](https://ebrains.eu) infrastructure for brain research.
Building on the [neuroglancer](https://github.com/google/neuroglancer) technology, it allows to interact with very large image volumes.

!!! Info
	Found a bug? Get in touch with us at <inm1-bda@fz-juelich.de>

<!-- [![logo](images/HBP_sm.jpg)](https://humanbrainproject.eu) -->
[![logo](images/ebrains-logo-dark.svg)](https://ebrains.eu)

<!-- - develop instance: <https://voluba-next.apps-dev.hbp.eu> -->
<!-- - user documentation: <https://voluba-user-doc.apps-dev.hbp.eu/> -->
<!-- - github repository: <https://github.com/fzj-inm1-bda/landmark-reg> -->
