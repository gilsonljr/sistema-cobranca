@echo off
echo Running frontend tests...
cd %~dp0
npm test -- --watchAll=false
