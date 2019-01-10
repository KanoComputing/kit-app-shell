import * as mockFs from 'mock-fs';
import { assert } from 'chai';
import { AppXManifest } from './manifest';

const sampleXml = `
<?xml version="1.0" encoding="utf-8"?>
<Package
   xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"
   xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10"
   xmlns:rescap="http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities">
  <Identity Name="TestIdentity"
    ProcessorArchitecture="x64"
    Publisher="TestPublisher"
    Version="1.0.0.0" />
  <Properties>
    <DisplayName>Sample App</DisplayName>
    <PublisherDisplayName>TestPublisher</PublisherDisplayName>
    <Description>No description entered</Description>
    <Logo>assets\\SampleAppx.50x50.png</Logo>
  </Properties>
  <Resources>
    <Resource Language="en-us" />
  </Resources>
  <Dependencies>
    <TargetDeviceFamily Name="Windows.Desktop" MinVersion="10.0.14316.0" MaxVersionTested="10.0.14316.0" />
  </Dependencies>
  <Capabilities>
    <rescap:Capability Name="runFullTrust"/>
  </Capabilities>
  <Applications>
    <Application Id="TestApp" Executable="./SampleApp.exe" EntryPoint="Windows.FullTrustApplication">
      <uap:VisualElements
       BackgroundColor="#ff00ff"
       DisplayName="Test Name"
       Square150x150Logo="assets\\SampleAppx.150x150.png"
       Square44x44Logo="assets\\SampleAppx.44x44.png"
       Description="Desc">
        <uap:DefaultTile Wide310x150Logo="assets\\SampleAppx.310x150.png" />
      </uap:VisualElements>
    </Application>
  </Applications>
</Package>
`;

suite('manifest', () => {
    let manifest : AppXManifest;
    setup(() => {
        mockFs({
            '/test.xml': sampleXml,
        });
        manifest = new AppXManifest('/test.xml');
        return manifest.open();
    })
    test('setLogo', () => {
        manifest.setLogo('TestApp', 'Square150x150Logo', 'assets/testLogo.png')
        const result = manifest.toString();
        assert.include(result, 'Square150x150Logo="assets/testLogo.png"');
    });
    test('setDefaultTile', () => {
        manifest.setDefaultTile('TestApp', 'Wide310x150Logo', 'assets/testLogo.png')
        const result = manifest.toString();
        assert.include(result, 'DefaultTile Wide310x150Logo="assets/testLogo.png"');
    });
    test('setMainLogo', () => {
        manifest.setMainLogo('assets/mainLogo.png')
        const result = manifest.toString();
        assert.include(result, '<Logo>assets/mainLogo.png</Logo>');
    });
    test('setCapabilities', () => {
        manifest.setCapabilities(['TestCap'])
        const result = manifest.toString();
        assert.include(result, 'rescap:Capability Name="TestCap"');
    });
    teardown(() => {
        mockFs.restore();
    });
});
