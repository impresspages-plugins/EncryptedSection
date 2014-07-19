# Encrypted Section for ImpressPages

This [ImpressPages](www.impresspages.org) [Plugin](http://www.impresspages.org/docs/plugin) provides a [Widget](http://www.impresspages.org/docs/widgets) for an encrypted section.

The **key feature** of this widget is that its content is completely encrypted **on the client**. The plaintext is **never** sent to the server. Encryption is done with the great AES cypher of the [forge javascript library](https://github.com/digitalbazaar/forge#cipher).

## Status

Encrypted Section Plugin reached it's first public beta release and is under heavy development.

## Installation

 - Copy all the directory `EncryptedSection/` into your ImpressPage's PluginDir: `ImpressPages/Plugin/EncryptedSection/`
 - Enable the Plugin via the ImpressPage Admin Menu: Menu -> Plugins -> Encrypted Section Widget -> Activate
 - Then you will find the new lock icon in your admin bar at the top when editing ImpressPages content.

## Usage 
 
Add a new encrypted section to a page

 - Simply drag'n'drop the lock icon from the top bar onto a page. 
 - Choose an initial password for the newly added encrypted section
 - and edit the section as you normally would.
 - Then lock the section with the red "Lock" menu entry in the TinyMCE icon bar.

Edit an existing encrypted section

 - Click the lock icon
 - Enter the password
 - Now you can edit the content of this encrypted section
 - Do not forget to lock your encrypted section again.

## Screenshot

![Encrypted Plugin Screenshot](https://dl.dropboxusercontent.com/u/11322584/EncryptedSectionScreenshot/ipEncryptedSection-20140720.png)

## Licence

This is free software licenced under [GPL](www.gnu.org/copyleft/gpl.html).

## About the autor

I have more than 10 years of professional expertise in programming - mostly JavaEE. Doing web development in PHP and javascript is just my private hobby as long as time permits. Which is about an hour per week. *g* This plugin was mostly developed after 22 o'clock in my spare time.

[www.doogie.de](www.doogie.de)