import json
import math
import pprint

import flask_restful
import numpy as np
from flask_restful import Resource, request, url_for

from . import lib

# Standard codes
HTTP_200_OK = 200
HTTP_501_NOT_IMPLEMENTED = 501


class LeastSquaresAPI(Resource):
    def post(self):
        print(json.dumps(request.json, indent=4, sort_keys=True))
        transformation_type = request.json['transformation_type']
        landmark_pairs = request.json['landmark_pairs']
        source_points = np.array([pair['source_point']
                                  for pair in landmark_pairs])
        target_points = np.array([pair['target_point']
                                  for pair in landmark_pairs])

        if transformation_type == 'rigid':
            mat = lib.umeyama(source_points, target_points,
                              estimate_scale=False,
                              allow_reflection=False)
        elif transformation_type == 'rigid+reflection':
            mat = lib.umeyama(source_points, target_points,
                              estimate_scale=False,
                              allow_reflection=True)
        elif transformation_type == 'similarity':
            mat = lib.umeyama(source_points, target_points,
                              estimate_scale=True,
                              allow_reflection=False)
        elif transformation_type == 'similarity+reflection':
            mat = lib.umeyama(source_points, target_points,
                              estimate_scale=True,
                              allow_reflection=True)
        elif transformation_type == 'affine':
            mat = lib.affine(source_points, target_points)
        else:
            return ({'error': 'unrecognized transformation_type'},
                    HTTP_501_NOT_IMPLEMENTED)

        inv_mat = np.linalg.inv(mat)

        mismatches = lib.per_landmark_mismatch(
            source_points, target_points, mat)
        for pair, mismatch in zip(landmark_pairs, mismatches):
            pair['mismatch'] = mismatch
        rmse = math.sqrt(np.mean(mismatches ** 2))

        if np.all(np.isfinite(mat)) and np.all(np.isfinite(inv_mat)):
            transformation_matrix = lib.np_matrix_to_json(mat)
            inverse_matrix = lib.np_matrix_to_json(inv_mat)
            return ({'transformation_matrix': transformation_matrix,
                     'inverse_matrix': inverse_matrix,
                     'landmark_pairs': landmark_pairs,
                     'RMSE': rmse},
                    HTTP_200_OK)
        else:
            return {'error': 'cannot compute least-squares solution '
                             '(singular matrix?)'}, HTTP_200_OK


class CreateAlignmentTaskAPI(Resource):
    def post(self):
        pprint.pprint(request.json)
        return {'alignment-task': url_for('alignment-task', id=3)}, 201


class AlignmentTaskAPI(Resource):
    def get(self):
        pprint.pprint(request.json)
        return {'status': ''}, 201


def register_api(app, *args, **kwargs):
    api = flask_restful.Api(app, *args, **kwargs)
    api.add_resource(LeastSquaresAPI, '/least-squares')
    api.add_resource(CreateAlignmentTaskAPI, '/alignment-task')
    api.add_resource(AlignmentTaskAPI, '/alignment-task/<int:id>',
                     endpoint='alignment-task')
