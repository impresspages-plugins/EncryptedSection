<?php


namespace Plugin\EncryptedSection;

/**
 * Filter for IpEncryptedSection Widget
 */
class Filter
{
    
    /**
     * add menu entry to $optionsMenu of encrypted section
     
    public static function ipWidgetManagementMenu($optionsMenu, $widgetRecord)
    {
        if ($widgetRecord['name'] == "IpEncryptedSection") {
            $optionsMenu[] = array(
                'title' => "Unlock section",
                'attributes' => array(
                    'id' => 'unlockSectionMenu',
                    //'onClick' => 'console.log("hereXXX")',
                    'data-widgetID' => $widgetRecord['id']
                )
            );
        }
        return $optionsMenu;
    }
    */
     
}
