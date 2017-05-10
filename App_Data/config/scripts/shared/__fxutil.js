// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
//
// This module is responsible for providing functions that are to be consumed in scripts and are dependent on the location of the script.
// There are 6 copies of this file - 3 in Application\App_Data\config\scripts\(scheduler|shared|table) 
// and 3 for the site extension scenario in NodeRuntimeSiteFiles\site\wwwroot\service\(scheduler|shared|table). Keep in mind that there
// is no mechanism in place that will update these files for site extensions, so if you need to update these files you need:
//   a) a VERY good reason for updating it
//   b) a plan for how the update will be pushed out

exports.require = function (moduleOrPath) {
    return require(moduleOrPath);
};

exports.resolve = function (moduleOrPath) {
    return require.resolve(moduleOrPath);
};