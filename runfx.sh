#!/bin/bash

echo "🎨 Complete Heroicons v2 compatibility fix..."

# Create a mapping of old icon names to new ones
declare -A icon_mapping=(
  ["TrendingUpIcon"]="ArrowTrendingUpIcon"
  ["TrendingDownIcon"]="ArrowTrendingDownIcon"
  ["RefreshIcon"]="ArrowPathIcon"
  ["ReplyIcon"]="ArrowUturnLeftIcon"
  ["LoginIcon"]="ArrowRightOnRectangleIcon"
  ["LogoutIcon"]="ArrowLeftOnRectangleIcon"
  ["MenuIcon"]="Bars3Icon"
  ["MenuAlt1Icon"]="Bars3BottomLeftIcon"
  ["MenuAlt2Icon"]="Bars3BottomRightIcon"
  ["MenuAlt3Icon"]="Bars3CenterLeftIcon"
  ["MenuAlt4Icon"]="Bars2Icon"
  ["CollectionIcon"]="RectangleStackIcon"
  ["ColorSwatchIcon"]="SwatchIcon"
  ["DesktopComputerIcon"]="ComputerDesktopIcon"
  ["DeviceMobileIcon"]="DevicePhoneMobileIcon"
  ["DocumentDownloadIcon"]="ArrowDownTrayIcon"
  ["DocumentUploadIcon"]="ArrowUpTrayIcon"
  ["DownloadIcon"]="ArrowDownTrayIcon"
  ["UploadIcon"]="ArrowUpTrayIcon"
  ["DuplicateIcon"]="DocumentDuplicateIcon"
  ["FastForwardIcon"]="ForwardIcon"
  ["RewindIcon"]="BackwardIcon"
  ["LocationMarkerIcon"]="MapPinIcon"
  ["MusicNoteIcon"]="MusicalNoteIcon"
  ["PhotographIcon"]="PhotoIcon"
  ["PuzzleIcon"]="PuzzlePieceIcon"
  ["ReceiptRefundIcon"]="ReceiptPercentIcon"
  ["ReceiptTaxIcon"]="ReceiptPercentIcon"
  ["SaveIcon"]="DocumentArrowDownIcon"
  ["SaveAsIcon"]="DocumentArrowDownIcon"
  ["SelectorIcon"]="ChevronUpDownIcon"
  ["SortAscendingIcon"]="BarsArrowUpIcon"
  ["SortDescendingIcon"]="BarsArrowDownIcon"
  ["SpeakerphoneIcon"]="MegaphoneIcon"
  ["StatusOfflineIcon"]="SignalSlashIcon"
  ["StatusOnlineIcon"]="SignalIcon"
  ["SunIcon"]="SunIcon"
  ["SwitchHorizontalIcon"]="ArrowsRightLeftIcon"
  ["SwitchVerticalIcon"]="ArrowsUpDownIcon"
  ["TemplateIcon"]="RectangleStackIcon"
  ["TranslateIcon"]="LanguageIcon"
  ["ViewGridIcon"]="Squares2X2Icon"
  ["ViewGridAddIcon"]="ViewColumnsIcon"
  ["ViewListIcon"]="ListBulletIcon"
  ["VolumeOffIcon"]="SpeakerXMarkIcon"
  ["VolumeUpIcon"]="SpeakerWaveIcon"
)

# Apply the fixes to all relevant files
for old_name in "${!icon_mapping[@]}"; do
  new_name="${icon_mapping[$old_name]}"
  echo "🔄 Replacing $old_name with $new_name..."

  find client/src -name "*.jsx" -o -name "*.js" -o -name "*.tsx" -o -name "*.ts" |
    xargs grep -l "$old_name" |
    xargs sed -i "s/$old_name/$new_name/g"
done

echo "✅ All icon names updated for Heroicons v2 compatibility"

# Also fix any import statements that might be using old syntax
find client/src -name "*.jsx" -o -name "*.js" -o -name "*.tsx" -o -name "*.ts" |
  xargs sed -i 's/@heroicons\/react\/outline/@heroicons\/react\/24\/outline/g'

find client/src -name "*.jsx" -o -name "*.js" -o -name "*.tsx" -o -name "*.ts" |
  xargs sed -i 's/@heroicons\/react\/solid/@heroicons\/react\/24\/solid/g'

echo "✅ Updated import paths for Heroicons v2"

# Commit all changes
git add client/src/
git commit -m "fix: Complete Heroicons v2 compatibility update

- Replace all deprecated icon names with v2 equivalents
- Update import paths from /outline to /24/outline
- Update import paths from /solid to /24/solid
- Ensure all icons work with latest Heroicons version

Key changes:
- TrendingUpIcon → ArrowTrendingUpIcon
- TrendingDownIcon → ArrowTrendingDownIcon
- MenuIcon → Bars3Icon
- And many other v2 compatibility fixes"

echo "✅ Committed all Heroicons fixes"

# Rebuild Docker
echo "🔄 Rebuilding with fixed icons..."
docker compose down
docker compose build --no-cache web
docker compose up -d

echo "🎉 All done! Icons should now work correctly."
