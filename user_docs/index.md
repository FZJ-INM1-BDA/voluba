# About voluba

"voluba" is an acronym for **Volu**metric **B**rain **A**nchoring. 
It is a browser based tool for interactive alignment of volumes of interest from brain imaging experiments with a high-resolution 3D reference brain model.

![image](images/teaser.png)

Spatial anchoring of high-resolution volumes of interest (VOIs) from different imaging experiments into the detailed anatomical context of a high-resolution reference model such as the [BigBrain](https://search.kg.ebrains.eu/instances/Dataset/d07f9305-1e75-4548-a348-b155fb323d31) became an important practical problem with increasingly available datasets during recent years. Working on a proper anchoring of such imaging data to the full-resolution reference template is out of reach for many neuroscientists due to the sheer size of the datasets, the lack of available tools, but also the problem to identify correspondences between the datasets in a reliable and reproducible way. voluba facilitates anchoring of volumetric image data to reference volumes at microscopical spatial resolutions. 

voluba allows to upload your own volume of interest to a private space on a server, perform the interactive image alignment in your web browser, and retrieve the resulting parameters of the spatial alignment. In voluba, the image alignment is performed by interactive manipulation of the input dataset's position and rotation, flipping of coordinate axes, and entering of 3D landmarks. 
Besides downloading the resulting transformation parameters, the aligned image can be opened in [siibra-explorer](https://atlases.ebrains.eu/viewer) to see it in the comprehensive 3D context offered by the [EBRAINS brain atlases](https://ebrains.eu/services/atlases). 

The main installation is hosted at <https://voluba.apps.hbp.eu>. voluba has been developed in the [Human Brain Project](https://humanbrainproject.eu) as an online service for integration of image data to brain atlases within the [EBRAINS](https://ebrains.eu) infrastructure for brain research.
Building on the [neuroglancer](https://github.com/google/neuroglancer) technology, it allows to interact with very large image volumes. voluba uses [Vue](https://vuejs.org) for the reactive UI layer, [Vuex](https://vuex.vuejs.org/) for state management, and [Bootstrap 4](https://getbootstrap.com/docs/4.0) for layout.

!!! Info
	Visit our [developer documentation](https://voluba-user-doc.apps-dev.hbp.eu/) for more detailed information about the technical aspects of voluba.