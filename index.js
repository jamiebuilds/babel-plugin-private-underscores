// @flow
'use strict';

function privateUnderscores({ types: t, template } /*: any */) {
  let buildSym = template(`
    let ID = Symbol(SYM);
  `);

  return {
    name: "private-underscores",
    visitor: {
      Class(classPath /*: any */) {
        let members = {};
        let program = classPath.hub.file.path;

        function createReference(name) {
          let ref = classPath.scope.generateUidIdentifier(name);

          program.get('body')[0].insertBefore(buildSym({
            ID: ref,
            SYM: t.stringLiteral(name)
          }));

          return ref;
        }

        classPath.traverse({
          'ClassMethod|ClassProperty'(memberPath) {
            if (memberPath.node.computed) return;
            let name = memberPath.node.key.name;
            if (!name.startsWith('_')) return;

            let ref = createReference(name);

            members[name] = ref;
            memberPath.node.computed = true;
            memberPath.get('key').replaceWith(ref);
          },
        });

        classPath.traverse({
          ThisExpression(path) {
            let parent = path.parentPath;

            if (parent.isMemberExpression() && !parent.node.computed) {
              let property = parent.get('property');
              let ref = members[property.node.name];

              if (ref) {
                parent.node.computed = true;
                property.replaceWith(ref)
              }
            }
          },
        });
      },
    },
  };
}

module.exports = privateUnderscores;
