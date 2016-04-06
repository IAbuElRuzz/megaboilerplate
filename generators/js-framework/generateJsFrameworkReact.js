import { join } from 'path';
import { copy, cpy, mkdirs, addNpmPackage, replaceCode, templateReplace } from '../utils';
import { noneClassMap, bootstrapClassMap, foundationClassMap, bourbonNeatClassMap } from '../css-framework/modules/class-maps.js';

async function generateJsFrameworkReact(params) {
  const build = join(__base, 'build', params.uuid);
  const server = join(build, 'server.js');
  const es6Transpiler = join(__dirname, 'modules', 'react', 'es6-transpiler.js');
  const mainJs = join(__dirname, 'modules', 'react', 'main.js');
  const reactRequire = join(__dirname, 'modules', 'react', 'react-require.js');
  const reactRoutesRequire = join(__dirname, 'modules', 'react', 'react-routes-require.js');
  const reactRoutes = join(__dirname, 'modules', 'react', 'routes.js');
  const serverRenderingWithRouting = join(__dirname, 'modules', 'react', 'server-rendering-with-routing.js');
  const babelrc = join(__dirname, 'modules', 'react', '.babelrc');

  switch (params.framework) {
    case 'express':

      // Copy .babelrc
      await cpy([babelrc], build);

      // Require react, react-router, react-dom packages
      await replaceCode(server, 'REACT_REQUIRE', reactRequire);
      await replaceCode(server, 'REACT_ROUTES_REQUIRE', reactRoutesRequire);

      // Add ES6 transpiler
      await replaceCode(server, 'ES6_TRANSPILER', es6Transpiler);

      // Add server-rendering  middleware
      await replaceCode(join(build, 'server.js'), 'REACT_SERVER_RENDERING', serverRenderingWithRouting);

      // Copy React components
      const components = join(__dirname, 'modules', 'react', 'components');

      await cpy([
        join(components, 'App.js'),
        join(components, 'Contact.js'),
        join(components, 'Footer.js'),
        join(components, 'Header.js'),
        join(components, 'Home.js'),
        join(components, 'Messages.js'),
        join(components, 'NotFound.js')
      ], join(build, 'app', 'components'));

      await cpy([
        join(components, 'Account', 'Forgot.js'),
        join(components, 'Account', 'Login.js'),
        join(components, 'Account', 'Profile.js'),
        join(components, 'Account', 'Reset.js'),
        join(components, 'Account', 'Signup.js')
      ], join(build, 'app', 'components', 'Account'));

      // Replace CSS classes based on CSS framework
      await replaceCssClasses(params, join(build, 'app', 'components', 'App.js'));
      await replaceCssClasses(params, join(build, 'app', 'components', 'Contact.js'));
      await replaceCssClasses(params, join(build, 'app', 'components', 'Footer.js'));
      await replaceCssClasses(params, join(build, 'app', 'components', 'Header.js'));
      await replaceCssClasses(params, join(build, 'app', 'components', 'Home.js'));
      await replaceCssClasses(params, join(build, 'app', 'components', 'Messages.js'));
      await replaceCssClasses(params, join(build, 'app', 'components', 'NotFound.js'));
      await replaceCssClasses(params, join(build, 'app', 'components', 'Account', 'Forgot.js'));
      await replaceCssClasses(params, join(build, 'app', 'components', 'Account', 'Login.js'));
      await replaceCssClasses(params, join(build, 'app', 'components', 'Account', 'Profile.js'));
      await replaceCssClasses(params, join(build, 'app', 'components', 'Account', 'Reset.js'));
      await replaceCssClasses(params, join(build, 'app', 'components', 'Account', 'Signup.js'));

      // Copy Redux actions, reducers, store
      const actions = join(__dirname, 'modules', 'react', 'actions');
      await cpy([
        join(actions, 'auth.js'),
        join(actions, 'contact.js'),
        join(actions, 'oauth.js')
      ], join(build, 'app', 'actions'));

      const reducers = join(__dirname, 'modules', 'react', 'reducers');
      await cpy([
        join(reducers, 'auth.js'),
        join(reducers, 'index.js'),
        join(reducers, 'messages.js')
      ], join(build, 'app', 'reducers'));

      const store = join(__dirname, 'modules', 'react', 'store');
      await cpy([join(store, 'configureStore.js')], join(build, 'app', 'store'));
      const configureStore = join(build, 'app', 'store', 'configureStore.js');
      const thunkAndDevTools = join(store, 'thunkAndDevTools.js');
      const thunk = join(store, 'thunk.js');

      // Optional: Redux Dev Tools
      if (params.reactOptions.includes('reduxDevTools')) {
        await replaceCode(configureStore, 'REDUX_STORE_ENHANCER', thunkAndDevTools, { indentLevel: 2 });
      } else {
        await replaceCode(configureStore, 'REDUX_STORE_ENHANCER', thunk, { indentLevel: 2 });
      }

      // Copy entry file and React routes
      await copy(mainJs, join(build, 'app', 'main.js'));
      await copy(reactRoutes, join(build, 'app', 'routes.js'));

      switch (params.templateEngine) {
        case 'jade':
          const layoutJade = join(build, 'views', 'layout.jade');
          const bundleJsJadeImport = join(__dirname, 'modules', 'react', 'react-jade-import.jade');
          const renderFileJade = join(__dirname, 'modules', 'react', 'render-template-jade.js');
          await replaceCode(server, 'RENDER_TEMPLATE', renderFileJade, { indentLevel: 3 });

          await replaceCode(layoutJade, 'JS_FRAMEWORK_MAIN_IMPORT', bundleJsJadeImport, { indentLevel: 2 });
          break;

        case 'handlebars':
          break;

        case 'nunjucks':
          const layoutNunjucks = join(build, 'views', 'layout.html');
          const bundleNunjucksImport = join(__dirname, 'modules', 'react', 'react-html-import.html');
          const renderFileNunjucks = join(__dirname, 'modules', 'react', 'render-template-nunjucks.js');

          await replaceCode(layoutNunjucks, 'JS_FRAMEWORK_MAIN_IMPORT', bundleNunjucksImport, { indentLevel: 1 });
          await replaceCode(server, 'RENDER_TEMPLATE', renderFileNunjucks);
          break;

        default:
          break;
      }
      break;

    case 'hapi':
      break;

    case 'meteor':
      break;

    default:
  }

  await addNpmPackage('babel-core', params);
  await addNpmPackage('babel-polyfill', params);
  await addNpmPackage('react', params);
  await addNpmPackage('react-dom', params);
  await addNpmPackage('react-router', params);
  await addNpmPackage('redux', params);
  await addNpmPackage('react-redux', params);
  await addNpmPackage('redux-thunk', params);
  await addNpmPackage('whatwg-fetch', params);

  if (params.authentication.length) {
    await addNpmPackage('react-cookie', params);
  }
}

export default generateJsFrameworkReact;

async function replaceCssClasses(params, filePath) {
  switch(params.cssFramework) {
    case 'bootstrap':
      await templateReplace(filePath, bootstrapClassMap);
      break;
    case 'foundation':
      await templateReplace(filePath, foundationClassMap);
      break;
    case 'bourbonNeat':
      break;
    case 'none':
      break;
  }
}
