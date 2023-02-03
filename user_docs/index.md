# About VoluBA

"VoluBA" is an acronym for **Volu**metric **B**rain **A**nchoring. 
It is a browser based tool for interactive alignment of volumes of interest from brain imaging experiments with a high-resolution 3D reference brain model.

![screenshot](images/teaser.png)

Spatial anchoring of high-resolution volumes of interest (VOIs) from specific imaging experiments into the detailed anatomical context of a high-resolution reference model like [BigBrain](https://search.kg.ebrains.eu/instances/Dataset/d07f9305-1e75-4548-a348-b155fb323d31) is a practical problem due to the size of many high-resolution volumes (BigBrain is one Terabyte of data!), and the lack of automatic methods for image alignment with partial volumetric datasets.
The main idea behind VoluBA is to allow interactive alignmnt to microscopic resolution 3D image volumes without downloading them to a local computer.
Instead, VoluBA allows to upload your own volume of interest - which is typically significantly smaller - to a private space on a server, perform the interactive image alignment in your web browser, and retrieve the resulting parameters of the spatial alignment.

In VoluBA, the image alignment is performed by interactive manipulation of the input dataset's position and rotation, flipping of coordinate axes, and entering of 3D landmarks. 
Besides downloading the resulting transformation parameters, the aligned image can be opened in [EBRAINS Interactive Atlas Viewer](https://atlases.ebrains.eu/viewer) to see it in the comprehensive 3D context offered by the [EBRAINS brain atlases](https//ebrains.eu/services/atlases). 
The main installation is hosted at <https://voluba.apps.hbp.eu> and currently setup for anchoring high-resolution volumes of interest (VOIs) to the microscopic resolution human brain model ["BigBrain"](https://search.kg.ebrains.eu/instances/Dataset/d07f9305-1e75-4548-a348-b155fb323d31).

VoluBA uses [Vue](https://vuejs.org) for the reactive UI layer, [Vuex](https://vuex.vuejs.org/) for state management, and [Bootstrap 4](https://getbootstrap.com/docs/4.0) for layout.

VoluBA has been developed in the [Human Brain Project](https://humanbrainproject.eu) as an online service for integration of image data to brain atlases within the [EBRAINS](https://ebrains.eu) infrastructure for brain research.
Building on the [neuroglancer](https://github.com/google/neuroglancer) technology, it allows to interact with very large image volumes.

!!! Info
	Found a bug? Get in touch with us at <support@ebrains.eu>

!!! Info
	Visit our [developer documentation](https://voluba-user-doc.apps-dev.hbp.eu/) for more detailed information about the technical aspects of VoluBA.