@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    http://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM
@REM Required ENV vars:
@REM JAVA_HOME - location of a JDK home dir
@REM
@REM Optional ENV vars
@REM MAVEN_OPTS - parameters passed to the Java VM when running Maven
@REM     e.g. to debug Maven itself, use
@REM set MAVEN_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=8000
@REM ----------------------------------------------------------------------------

@echo off
setlocal

set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%
@REM Strip the trailing backslash. Passing "C:\path\backend\" as
@REM -Dmaven.multiModuleProjectDirectory escapes the closing quote on Windows,
@REM which breaks the rest of the java command line.
if "%APP_HOME:~-1%"=="\" set APP_HOME=%APP_HOME:~0,-1%

set WRAPPER_JAR="%APP_HOME%\.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

if not "%JAVA_HOME%" == "" goto OkJHome
set JAVACMD=java
goto checkJCmd

:OkJHome
set JAVACMD="%JAVA_HOME%\bin\java.exe"

:checkJCmd
if exist %JAVACMD% goto chkMHome
if exist "%JAVA_HOME%\bin\java.exe" set JAVACMD="%JAVA_HOME%\bin\java.exe"
if exist %JAVACMD% goto chkMHome

echo Error: JAVA_HOME is not defined correctly.
echo We cannot execute %JAVACMD%
goto end

:chkMHome
%JAVACMD% %MAVEN_OPTS% -classpath %WRAPPER_JAR% "-Dmaven.multiModuleProjectDirectory=%APP_HOME%" %WRAPPER_LAUNCHER% %*
if ERRORLEVEL 1 goto error
goto end

:error
exit /b 1

:end
exit /b 0
