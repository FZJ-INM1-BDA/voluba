# Loading input data

The anchoring process starts by selecting a [reference space](#reference-space) you want to anchor to as well as the incoming volume. voluba provides a selection of example datasets
but also allows you to upload your own image data. Select an existing [public](#public-volumes) or [uploaded private input image](#private-volumes) and click `Start` to proceed to the alignment.

![screenshot](images/new_workflow.png)

## Reference space

In voluba the reference space defaults to the BigBrain model. Select a different space depending on the species your image data originates from. You can choose between the following:

| species | reference space | publication | preview |
|---------|-----------------|-|-|
| human   | BigBrain (2015) | [https://doi.org/10.1126/science.1235381](https://doi.org/10.1126/science.1235381) | ![](images/human.png) |
| rat     | WHS-SD atlas  | [https://doi.org/10.21203/rs.3.rs-2466303/v1](https://doi.org/10.21203/rs.3.rs-2466303/v1) | ![](images/rat.png) |
| mouse   | Allen CCFv3 | [https://doi.org/10.1016/j.cell.2020.04.007](https://doi.org/10.1016/j.cell.2020.04.007) | ![](images/mouse.png) |

## Public volumes

Under `Public volumes` you can find a selection of example datasets. We created them for you to easily try out the
features of voluba. By following our [Step-by-step tutorial](tutorial.md) you will learn how to successfully anchor our
Hippocampus volume to the BigBrain reference space.

Datasets published in the [EBRAINS Knowledge Graph](https://search.kg.ebrains.eu/) are not part of
the `Public volumes`. To align an image volume of a dataset in reference space, you have to download the volume from the
Knowledge Graph and upload it to voluba as a [private volume](#private-volumes).

## Private volumes

For anchoring your own image data you need to upload the volume to voluba. It will then be available for selection under
`Private volumes`.

To protect your uploaded data, you have to sign in with your [ORCID](https://orcid.org/)
or [EBRAINS](https://ebrains.eu) account first. The volumes will be stored in a private space that is not accessible to other
users.

!!! tip
    [Register](https://ebrains.eu/register/) for EBRAINS to get access to more tools, services and data for neuroscientists.

After login click on `Choose File` to select the image data you want to upload. voluba expects your files to be in NIfTI
format (.nii or .nii.gz). Please convert your data, if it has a different filetype. It is also advised to define the voxel resolution inside the NIfTI header via `pixdim` and `xyzt_units`, so that voluba initially displays the incoming volume in correct relation to the reference template. If you don't specify these values, voluba assumes 1 mm voxel resolution for your data.

!!! help
    Convert your image files to NIfTI with the help of our [HOW TO](nifti_conversion.md).

By clicking on `Upload` your data will be stored in your private space and is available for alignment. If you want to
permanently delete one of the `Private volumes`, select the according image data as incoming volume and click on the red
trash icon.

