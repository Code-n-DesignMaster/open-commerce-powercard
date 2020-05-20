#!/usr/bin/env groovy
@Library('ocp-jenkins-library')_
import com.stuzo.jenkins.aws.ecs
import com.stuzo.jenkins.dnb.cdenv

def ecs   = new ecs()
def cdenv = new cdenv()

properties([
    [$class: 'BuildDiscarderProperty', strategy: [$class: 'LogRotator', numToKeepStr: '5']],
    pipelineTriggers([
        [$class: 'GenericTrigger',
         causeString: 'Triggered on $HASH',
         genericVariables: [
            [defaultValue: 'NULL', key: 'REPO_NAME', regexpFilter: '', value: '.repository.name'],
            [defaultValue: 'NULL', key: 'SOURCE', regexpFilter: '', value: '.pullrequest.source.branch.name'],
            [defaultValue: 'NULL', key: 'DESTINATION', regexpFilter: '', value: '.pullrequest.destination.branch.name'],
            [defaultValue: 'NULL', key: 'HASH', regexpFilter: '', value: '.pullrequest.merge_commit.hash'],
            [defaultValue: 'NULL', key: 'BBUSER', regexpFilter: '', value: '.actor.nickname']
         ],
         token: 'edd79dddf903867e3b099b264d2ec4712c7e2ff7',
         regexpFilterExpression: '^((develop|master)(?!-.*))|^(feature(s)?|release(s)?|hotfix(es)?|bugfix(es)?)\\/.+$',
         regexpFilterText: '$SOURCE_0'
        ]
    ])
])

def branch_type     = get_branch_type("${env.DESTINATION_0}")
def branch_env      = cdenv.get_branch_deployment_environment(branch_type)
def ecr_repo        = branch_env[0]
def ecr_region      = branch_env[1]
def aws_region      = branch_env[2]
def aws_creds       = branch_env[3]
def ecs_cluster     = branch_env[4]
def dev_env         = branch_env[5]
def env_url         = branch_env[6]
def mars_api_url    = branch_env[7]
def mars_client_key = branch_env[8]
def service         = cdenv.getServiceName(REPO_NAME_0)
def version         = "${DESTINATION_0}-${HASH_0}"

try {
    buildApp()
    testApp(mars_api_url, mars_client_key)
    staticAnalysis()

    if (dev_env != "feature") {
        buildDockerImage(ecr_repo, service, version)
        pushDockerImage(cdenv, branch_env, service, version)
        deploy(ecs, dev_env, aws_creds, ecs_cluster, service, version, aws_region)
        if (dev_env != "prod") {
            integrationTests(dev_env)
        }
    } 

    // PLACEHOLDERS
    if (branch_type == "dev") {
        startRelease()
    }
    if (branch_type == "release") {
        finishRelease()
    }
    if (branch_type == "hotfix") {
        finishHotfix()
    }
} finally {
    notifySlack(service, version, dev_env)
}

def buildApp() {
    stage('build app') {
        node ('ec2_agent') { 
            cleanWs()
            checkout scm: [$class: 'GitSCM', userRemoteConfigs: [[url: 'git@bitbucket.org:stuzo/$REPO_NAME_0.git', 
            credentialsId: 'jenkins-bitbucket']], branches: [[name: '$HASH_0']]],poll: false
            currentBuild.displayName = "${BUILD_NUMBER} : ${env.SOURCE_0} -> ${env.DESTINATION_0}"
            withCredentials([string(credentialsId: 'NPM_TOKEN', variable: 'NPM_TOKEN')]) {
              sh 'cp npmrc-jenkins .npmrc'
              sh 'docker run -t --rm -v $(pwd):/app -w /app -e NPM_TOKEN=${NPM_TOKEN} node:10.15 npm install'
              sh 'docker run -t --rm -v $(pwd):/app -w /app -e NPM_TOKEN=${NPM_TOKEN} node:10.15 npm run build'
            }
        }
    }
}

def testApp(mars_api_url, mars_client_key) {
    stage('test app') {
        node ('ec2_agent') { 
            withCredentials([
                string(credentialsId: 'MARS_CLIENT_SECRET_DEV', variable: 'MARS_CLIENT_SECRET_DEV'),
                string(credentialsId: 'NPM_TOKEN', variable: 'NPM_TOKEN'),
            ]) {
                try {
                    sh 'docker run -t --rm -v $(pwd):/app -w /app -e NPM_TOKEN=${NPM_TOKEN} -e MARS_CLIENT_SECRET=${MARS_CLIENT_SECRET_DEV}' + " -e MARS_API_URL=${mars_api_url} -e MARS_CLIENT_KEY=${mars_client_key} node:10.15 npm run test:ci"
                } finally {
                    junit 'test-reports/junit.xml'
                }
            }
        }
    }
}

def staticAnalysis() {
    stage('static analysis') {
        node ('ec2_agent') {
            def scannerHome = tool 'sonar-scanner';
            withSonarQubeEnv( credentialsId: 'local-sonarqube') { 
                nodejs('node-10.15') {
                    sh "${scannerHome}/bin/sonar-scanner"
                }
            }
            sh "echo 'Waiting for Sonar Qube Analysis..'"
            /* DISABLE UNTIL WE CATCH UP ON TEST COVERAGE
            sleep(10)
            timeout(time: 10, unit: 'MINUTES') { 
                def qg = waitForQualityGate(webhookSecretId: 'sonar-qg-secret') 
                if (qg.status != 'OK') {
                    slackSend (channel: '#db-ci', color: '#F01717', message: "*$JOB_NAME*, <$BUILD_URL|Build #$BUILD_NUMBER>: Quality Gate threshold was not met! <https://jenkins-sq-ocp.stuzo.net/projects|Review in SonarQube>.")
                    error "Pipeline aborted due to quality gate failure: ${qg.status}"
                }
            } */
        }
    }
}

def buildDockerImage(ecr_repo, service, version) {
    stage('build docker image') {
        node ('ec2_agent') {
            withCredentials([string(credentialsId: 'NPM_TOKEN', variable: 'NPM_TOKEN')]) {
                sh 'cp npmrc-jenkins .npmrc'
                sh "docker build -t ${ecr_repo}/${service}:${version} --build-arg NPM_TOKEN=${NPM_TOKEN} -f Dockerfile ."
            }
        }
    }
}

def pushDockerImage(cdenv, branch_env, service, version) {
    stage('push docker image') {
        node ('ec2_agent') {
            branch_env.add(service)
            branch_env.add(version)
            cdenv.dockerPush(branch_env)
        }
    }
}

def deploy(ecs, dev_env, aws_creds, ecs_cluster, service, version, aws_region) {
    stage('deploy') {
        if (dev_env == "prod") {
            timeout(time: 1, unit: 'DAYS') {
                input "Deploy to ${dev_env} ?"
            }
            node ('ec2_agent') {
                sh "echo Deploying to ${dev_env}"
                //TODO specify the deployment
            } 
        } else {
            node ('ec2_agent') {
                sh "echo Deploying to ${dev_env}"
                ecs.Deploy(
	                    aws_creds, dev_env, ecs_cluster, service, version, aws_region
	            )
            }
        }
    }

}

def integrationTests(dev_env) {
    stage('integration tests') {
        node ('ec2_agent') {
            sh "echo Running integration tests in ${dev_env}"
            //TODO do the actual tests
        }
    }
}

def startRelease() {
    stage('start release') {
        timeout(time: 1, unit: 'HOURS') {
            input "Do you want to start a release?"
        }
        node ('ec2_agent') {
            sh 'echo "start release"'
        }
    }
}

def finishRelease() {
    stage('finish release') {
        timeout(time: 1, unit: 'HOURS') {
            input "Is the release finished?"
        }
        node {
            sh 'echo "end release"'
        }
    }
}

def finishHotfix() {
    stage('finish hotfix') {
        timeout(time: 1, unit: 'HOURS') {
            input "Is the hotfix finished?"
        }
        node {
            sh 'echo "finish hotfix"'
        }
    }
}

def notifySlack(service, version, dev_env) {
  buildResult = currentBuild.currentResult
    if (buildResult == "SUCCESS") {
      color = "green"
      message = "Job: ${JOB_NAME} ${BUILD_NUMBER} succeed in deploying ${service} to ENV: ${dev_env}, VERSION: ${version}"
    }
    if (buildResult == "FAILURE") {
      color = "green"
      message = "Job: ${JOB_NAME} ${BUILD_NUMBER} failed to deploy ${service} to ENV: ${dev_env}, VERSION: ${version}"
    }
    slackSend(channel: "#db-ci", color: color, message: message)
}

// Utility functions
def get_branch_type(String branch_name) {
    def dev_pattern = ".*develop"
    def release_pattern = ".*release/.*"
    def feature_pattern = ".*feature/.*"
    def hotfix_pattern = ".*hotfix/.*"
    def master_pattern = ".*master"
    if (branch_name =~ dev_pattern) {
        print "DEV"
        return "dev"
    } else if (branch_name =~ release_pattern) {
        print "RELEASE"
        return "release"
    } else if (branch_name =~ master_pattern) {
        print "MASTER"
        return "master"
    } else if (branch_name =~ feature_pattern) {
        print "FEATURE"
        return "feature"
    } else if (branch_name =~ hotfix_pattern) {
        print "HOTFIX"
        return "hotfix"
    } else {
        throw new RuntimeException("Unknown Branch Type for Branch: ${branch_name} Exiting..")
    }
}
