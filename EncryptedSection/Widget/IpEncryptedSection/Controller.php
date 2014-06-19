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

/**    
    public function defaultData() {
        return array("plainText" => "DefaultPlainText");
    }
*/    
/*
    public function generateHtml($revisionId, $widgetId, $data, $skin)
    {
        $data['isLocked'] = true;
        
        //TODO: GIVEN an encrypted section in normal view (see PublicController.php), IF a nuser clicks the unlock icon, THEN the sections content is decrypted and the plaintext is shown in !readonly! mode .
        //TODO: GIVEN an encrpyted section in preview mode, THEN it will always be shown locked.

        return parent::generateHtml($revisionId, $widgetId, $data, $skin);
    }
 */
}