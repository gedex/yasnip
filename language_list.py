#!/usr/bin/env python
# Language list was generated using the following lines of Python
from pygments.lexers import get_all_lexers
import json
xs = [ (x[0], i) for i, x, _, _ in get_all_lexers() ]
xs.sort()

f = open('langs.txt', 'w')
json.dump(xs, f)

