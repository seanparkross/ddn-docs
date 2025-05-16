import * as core from '@actions/core';
import * as github from '@actions/github';

/**
 * Helper function to fetch DRI information by property and value
 */
async function getDRIByProperty(property: string, value: string): Promise<any | null> {
  const url = `https://website-api.hasura.io/docs-services/docs-server/dri/lookup?property=${encodeURIComponent(
    property
  )}&value=${encodeURIComponent(value)}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      core.error(`Error fetching DRI data: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    if (error instanceof Error) {
      core.error(`Failed to fetch DRI data: ${error.message}`);
    }
    return null;
  }
}

/**
 * Main function to assign DRIs based on changed connector docs
 */
export async function assignDRIReviewers(): Promise<void> {
  try {
    // Get inputs from the workflow
    const changedFiles = core
      .getInput('changed_files')
      .split(' ')
      .filter(f => f.length > 0);

    if (changedFiles.length === 0) {
      core.info('No relevant connector documentation files changed.');
      return;
    }

    core.info('Changed connector files: ' + changedFiles);

    const assignees = new Set<string>();
    const connectorPathRegex = /^docs\/reference\/connectors\/([^\/]+)\//;
    const uniqueConnectorFolders = new Set<string>();

    // First collect all unique connector folders
    for (const filePath of changedFiles) {
      const match = filePath.match(connectorPathRegex);
      if (match && match[1]) {
        uniqueConnectorFolders.add(match[1]);
      }
    }

    core.info(`Found ${uniqueConnectorFolders.size} unique connector folders with changes`);

    // Now make API calls only once per unique folder
    for (const connectorFolder of uniqueConnectorFolders) {
      core.info(`Looking up DRI for connector folder: ${connectorFolder}`);

      // Fetch DRI information from the API
      const connectorInfo = await getDRIByProperty('registry-folder', connectorFolder);

      if (
        connectorInfo &&
        connectorInfo['dri-github-handle'] &&
        connectorInfo['dri-github-handle'].toLowerCase() !== 'null'
      ) {
        let handle = connectorInfo['dri-github-handle'];
        if (handle.startsWith('@')) {
          handle = handle.substring(1);
        }
        if (handle) {
          assignees.add(handle);
          core.info(`Found DRI ${handle} for connector ${connectorFolder}`);
        }
      } else {
        core.info(`No DRI found for connector folder: ${connectorFolder}`);
      }
    }

    const drIndividuals = Array.from(assignees);
    if (drIndividuals.length > 0) {
      core.info(`Requesting review from DRIs: ${drIndividuals.join(', ')}`);

      // Set output to be used in the workflow
      core.setOutput('reviewers', JSON.stringify(drIndividuals));

      core.info('Done requesting reviews from DRIs.');
    } else {
      core.info('No DRIs found to request a review for the changed files.');
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`Action failed with error: ${error.message}`);
    } else {
      core.setFailed('Action failed with an unknown error');
    }
  }
}

// Run the function if this is the main module
if (require.main === module) {
  assignDRIReviewers();
}
