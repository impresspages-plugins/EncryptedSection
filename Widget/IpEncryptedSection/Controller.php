<?php
/**
 * @package ImpressPages

 *
 */
namespace Plugin\EncryptedSection\Widget\IpEncryptedSection;




class Controller extends \Ip\WidgetController{

    /** return title for Encrypted Section */
    public function getTitle() {
        return __('Encrypted Section', 'ipAdmin');
    }

    /** initially the section has no content. Default skin will show a helpfull message to the enduser. */
    public function defaultData() {
        return array("encryptedText" => "");
    }

/*  VERWORFEN! :
    public function generateHtml($revisionId, $widgetId, $data, $skin)
    {
        $data['isLocked'] = true;
        
        //NO:   unlocking and decription a section must be done in the client in javascsript!!!
        //GIVEN an encrypted section in normal view (see PublicController.php), IF a nuser clicks the unlock icon, THEN the sections content is decrypted and the plaintext is shown in !readonly! mode .
        //GIVEN an encrpyted section in preview mode, THEN it will always be shown locked.

        return parent::generateHtml($revisionId, $widgetId, $data, $skin);
    }
 */
}